import type { CategoryId } from "../types";
export interface StudyImage {
  id: string;
  categoryId: CategoryId;
  title: string;
  description: string;
  src: string;
  sourceUrl: string;
  artist: string;
  license: string;
  licenseUrl: string;
  keywords: string;
}
export const STUDY_IMAGES: StudyImage[] = [
  {
    id: "earth",
    categoryId: "gk-current-affairs",
    title: "Our blue planet",
    description: "Earth photographed by the Apollo 17 crew in 1972.",
    src: "/images/earth.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:The_Blue_Marble_(remastered).jpg",
    artist: "NASA / Apollo 17 crew",
    license: "Public domain",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:The_Blue_Marble_(remastered).jpg#Licensing",
    keywords:
      "earth world geography space planet nasa apollo africa पृथ्वी दुनिया भूगोल अंतरिक्ष ग्रह अफ्रीका",
  },
  {
    id: "processor",
    categoryId: "technology",
    title: "Inside modern computing",
    description: "An Intel Core i9-14900KF central processing unit.",
    src: "/images/processor.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Intel_i9-14900KF_CPU.jpg",
    artist: "Pstrahl",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    keywords:
      "computer computing technology cpu processor intel chip hardware तकनीक कंप्यूटर प्रोसेसर चिप हार्डवेयर",
  },
  {
    id: "rubiks-cube",
    categoryId: "puzzles",
    title: "A twist of logic",
    description: "A solved Rubik’s Cube, a classic three-dimensional puzzle.",
    src: "/images/rubiks-cube.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rubiks_cube_solved.jpg",
    artist: "Mike Gonzalez (TheCoffee); color revision: Korax1214",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    keywords:
      "rubik cube puzzle logic pattern brain teaser colours पहेली पहेलियाँ तर्क दिमाग रंग घन रूबिक",
  },
  {
    id: "parthenon",
    categoryId: "mythology",
    title: "Stories set in stone",
    description: "The Parthenon in Athens, a temple dedicated to Athena.",
    src: "/images/parthenon.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:The_Parthenon_in_Athens.jpg",
    artist: "Steve Swayne",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    keywords:
      "parthenon athens greece greek athena temple mythology ancient history पौराणिक कथाएँ यूनान ग्रीस एथेना मंदिर इतिहास",
  },
];
