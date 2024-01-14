import Hammer from 'hammerjs';
import { Plugin } from 'vue';

type ExtractInterfaces<T> = {
  [K in keyof T]: T[K] extends new (options: RecognizerOptions) => any
    ? K
    : never;
}[keyof T];

type ExtractKeys<T, U> = {
  [K in keyof T]: K extends U ? K : never;
}[keyof T];

type DirectionKeys = ExtractKeys<HammerStatic, string & `DIRECTION_${string}`>;

// type Recognizer = Extract<keyof HammerStatic, string>;
type RecognizerType = ExtractInterfaces<HammerStatic>;

type MyPlugin = Plugin & {
  capitalize: (str: string) => RecognizerType;
  buildEventWithDirections: (eventName: string, directionArray: []) => string;
  guardDirections: (options: any) => void;
};
const gestures = ['tap', 'pan', 'pinch', 'press', 'rotate', 'swipe'];
const subGestures = [
  'panstart',
  'panend',
  'panmove',
  'pancancel',
  'pinchstart',
  'pinchmove',
  'pinchend',
  'pinchcancel',
  'pinchin',
  'pinchout',
  'pressup',
  'rotatestart',
  'rotatemove',
  'rotateend',
  'rotatecancel',
];
const directions = [
  'up',
  'down',
  'left',
  'right',
  'horizontal',
  'vertical',
  'all',
];

export const VueHammer: MyPlugin = {
  install(Vue, config = {}) {
    Vue.directive('hammer', {
      beforeMount: (el, binding) => {
        if (!el.hammer) {
          // Manager是所有识别器实例的容器，它为你的元素安装了交互事件监听器，并设置了触摸事件特性
          el.hammer = new Hammer.Manager(el);
        }
        const mc = el.hammer;

        /**
         * 如指令为v-hammer:tap.16
         * binding.arg为tap
         * binding.modifiers为{16:true}
         */
        const event = binding.arg as string;
        if (!event) {
          console.warn('[vue-hammer] event type argument is required.');
        }

        el.__hammerConfig = el.__hammerConfig || {};
        el.__hammerConfig[event] = {};

        const direction = binding.modifiers;
        el.__hammerConfig[event].direction =
          el.__hammerConfig[event].direction || [];

        // 将binding.modifiers的key赋值给el.__hammerConfig[binding.arg]的direction属性
        if (Object.keys(direction).length) {
          Object.keys(direction)
            .filter((keyName) => binding.modifiers[keyName])
            .forEach((keyName) => {
              const elDirectionArray = el.__hammerConfig[event].direction;
              if (elDirectionArray.indexOf(keyName) === -1) {
                elDirectionArray.push(String(keyName));
              }
            });
        }

        let recognizerType, recognizer;

        // 自定义手势事件，格式例子如下：
        // customEvents: {
        // 	swipeleft: { type: 'swipe', direction: Hammer.DIRECTION_LEFT },
        // 	swiperight: { type: 'swipe', direction: Hammer.DIRECTION_RIGHT },
        // },
        if (config.customEvents?.[event]) {
          const custom = config.customEvents[event];
          recognizerType = custom.type;

          // 自定义创建一个识别器实例，一个识别器实例只能识别一个手势
          // 自定义手势识别器本质上也是 Hammer.js 内置的识别器（即gestures数组中的某个值），只是通过自定义配置来适应特定的手势需求
          recognizer = new Hammer[this.capitalize(recognizerType)]();

          // 将识别器关联起来，使它们能够共同工作
          recognizer.recognizeWith(mc.recognizers);

          // 将识别器添加到管理器
          mc.add(recognizer);
        } else {
          // 内建事件

          // 判断自定义指令事件类型是否有效，即是否在Hammerjs预定义的手势事件或者子手势事件中
          recognizerType = gestures.find((gesture) => gesture === event);
          const subGesturesType = subGestures.find(
            (gesture) => gesture === event,
          );

          // 都不匹配，无效的事件类型，发出警告
          if (!recognizerType && !subGesturesType) {
            console.warn('[vue-hammer] invalid event type: ' + event);
            return;
          }

          // 这些子手势事件，是作为具体手势的状态或阶段存在的，而不是具体的动作，因此不涉及方向的概念
          if (
            subGesturesType &&
            el.__hammerConfig[subGesturesType].direction.length !== 0
          ) {
            console.warn(
              '[vue-hammer] ' + subGesturesType + ' should not have directions',
            );
          }

          // 这些预定义手势本身不包含方向性，配置direction可能会导致不符合预期的行为
          if (
            recognizerType === 'tap' ||
            recognizerType === 'pinch' ||
            recognizerType === 'press' ||
            recognizerType === 'rotate'
          ) {
            if (el.__hammerConfig[recognizerType].direction.length !== 0) {
              throw Error(
                '[vue-hammer] ' +
                  recognizerType +
                  ' should not have directions',
              );
            }
          }

          // 保证子手势添加至监听器之前，对应的预定义手势已创建识别器实例
          if (!recognizerType && subGesturesType) {
            recognizerType = gestures.find((gesture) =>
              subGesturesType.includes(gesture),
            );
          }
          // 从管理器中获取指定类型手势识别器，确保同一类型的手势在管理器中只有一个实例
          recognizer = mc.get(recognizerType);
          if (!recognizer && recognizerType) {
            // add recognizer
            recognizer = new Hammer[this.capitalize(recognizerType)]({
              enable: true,
            });
            // make sure multiple recognizers work together...
            recognizer.recognizeWith(mc.recognizers);
            mc.add(recognizer);

            // 将全局配置应用到当前手势识别器上
            const globalOptions = config[recognizerType as string];
            if (globalOptions) {
              this.guardDirections(globalOptions);
              recognizer.set(globalOptions);
            }
          }
        }
      },
      /**
       * 添加 Hammer.js 手势事件的监听器
       * 如果事件是预定义的子手势（subGestures），则直接使用该事件类型
       * 否则使用 buildEventWithDirections 函数生成带有方向的事件类型
       * 如指令为v-hammer:pan.up.left='onPan'，则当监听到节点“向下或者向左平移”的手势时，触发onPan函数
       */
      mounted: (el, binding) => {
        const mc = el.hammer;
        const event = binding.arg as string;
        const eventWithDir = subGestures.find((subGes) => subGes === event)
          ? event
          : this.buildEventWithDirections(
              event,
              el.__hammerConfig[event].direction,
            );
        if (mc.handler) {
          mc.off(eventWithDir, mc.handler);
        }
        if (typeof binding.value !== 'function') {
          mc.handler = null;
          console.warn(
            '[vue-hammer] invalid handler function for v-hammer: ' +
              binding.arg,
          );
        } else {
          mc.on(eventWithDir, (mc.handler = binding.value));
        }
      },
      updated: (el, binding) => {
        const mc = el.hammer;
        const event = binding.arg as string;
        const eventWithDir = subGestures.find((subGes) => subGes === event)
          ? event
          : this.buildEventWithDirections(
              event,
              el.__hammerConfig[event].direction,
            );
        // teardown old handler
        if (mc.handler) {
          mc.off(eventWithDir, mc.handler);
        }
        if (typeof binding.value !== 'function') {
          mc.handler = null;
          console.warn(
            '[vue-hammer] invalid handler function for v-hammer: ' +
              binding.arg,
          );
        } else {
          mc.on(eventWithDir, (mc.handler = binding.value));
        }
      },
      unmounted: (el, binding) => {
        const mc = el.hammer;
        const event = binding.arg;
        if (event) {
          const eventWithDir = subGestures.find((subGes) => subGes === event)
            ? event
            : this.buildEventWithDirections(
                event,
                el.__hammerConfig[event].direction,
              );
          if (mc.handler) {
            el.hammer.off(eventWithDir, mc.handler);
          }
          if (!Object.keys(mc.handlers).length) {
            el.hammer.destroy();
            el.hammer = null;
          }
        }
      },
    });
  },
  /**
   * 处理Hammer配置的方向属性，确保方向属性的有效性，以便正确配置Hammer.js的手势识别
   */
  guardDirections(options: any) {
    const dir = options.direction;
    if (typeof dir === 'string') {
      const hammerDirection = ('DIRECTION_' +
        dir.toUpperCase()) as DirectionKeys;
      if (
        directions.indexOf(dir) > -1 &&
        Object.prototype.hasOwnProperty.call(Hammer, hammerDirection)
      ) {
        options.direction = Hammer[hammerDirection];
      } else {
        console.warn('[vue-hammer] invalid direction: ' + dir);
      }
    }
  },

  /**
   * 根据传入的事件名称和方向数组，构建出带有方向后缀的事件名称。
   * eventName='pan',directionArray=['up','left']
   * returns 'panup panleft',
   */
  buildEventWithDirections(eventName: string, directionArray: []) {
    const f: any = {};
    directionArray.forEach((dir: string) => {
      dir = dir.toLowerCase();
      if (dir === 'horizontal') {
        f.left = 1;
        f.right = 1;
      } else if (dir === 'vertical') {
        f.up = 1;
        f.down = 1;
      } else if (dir === 'all') {
        f.left = 1;
        f.right = 1;
        f.up = 1;
        f.down = 1;
      } else {
        f[dir] = 1;
      }
    });
    const _directionArray = Object.keys(f);
    if (_directionArray.length === 0) {
      return eventName;
    }
    const eventWithDirArray = _directionArray.map((dir) => {
      return eventName + dir;
    });
    return eventWithDirArray.join(' ');
  },

  capitalize(str: string): RecognizerType {
    return (str.charAt(0).toUpperCase() + str.slice(1)) as RecognizerType;
  },
};
