import path from "path";
import {readdirSync} from "fs";

interface IPage {
  name:string;
  path?:string;
  template?:string;
}

export const ROOT_DIR = path.resolve(__dirname,'..');

const readPages = (srcDir: string): IPage[] => {
  const pagesDir = path.resolve(srcDir, 'pages');
  let pages:IPage[] = readdirSync(pagesDir, {withFileTypes:true}).filter(o=> o.isDirectory() && !/^[._]/.test(o.name)).map(o=>({name: o.name,path:path.join('pages',o.name)}))

  if(!pages.length){
    pages=[{
      name:'index',
      path: '',
    }]
  }

  return pages;
}

export const PAGES = readPages(path.resolve(ROOT_DIR,'src'));

export const getEntryPath = () => {
  return PAGES.reduce((page,{name}) => {
    page[name] = path.resolve(ROOT_DIR, `src/pages/${name}/index.html`);
    return page;
  },{})
}