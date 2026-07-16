export interface IProject {
  name: string;
  summary: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  links: {
    label: string;
    href: string;
  }[];
}
