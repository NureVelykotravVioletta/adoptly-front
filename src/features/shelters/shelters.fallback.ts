import type { Shelter } from "@/src/types/api";

export const FALLBACK_SHELTERS: Shelter[] = [
  {
    id: "hvostyky",
    name: "Дім Хвостиків",
    city: "Київ",
    address: "вул. Добра, 12",
    description:
      "Затишний притулок для котів і собак, де кожна тварина отримує турботу та увагу.",
    imageUrl:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=720&q=80",
    images: [
      {
        id: "hvostyky-img-1",
        imageUrl:
          "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/hvostyky-1",
      },
      {
        id: "hvostyky-img-2",
        imageUrl:
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/hvostyky-2",
      },
      {
        id: "hvostyky-img-3",
        imageUrl:
          "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/hvostyky-3",
      },
    ],
    animalsCount: 32,
    rating: 2,
    phone: "0965433456",
    email: "dim.hvostykiv@gmail.com",
    workingHours: "Пн-Сб 8:00-18:00",
    foundedAt: "2018",
  },
  {
    id: "lapky-nadii",
    name: "Лапки Надії",
    city: "Львів",
    address: "вул. Надії, 8",
    description:
      "Притулок, що спеціалізується на порятунку покинутих та травмованих тварин.",
    imageUrl:
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=720&q=80",
    images: [
      {
        id: "lapky-nadii-img-1",
        imageUrl:
          "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/lapky-nadii-1",
      },
    ],
    animalsCount: 18,
    rating: 6,
    phone: "0671234567",
    email: "lapky.nadii@gmail.com",
    workingHours: "Пн-Пт 9:00-18:00",
    foundedAt: "2020",
  },
  {
    id: "druhe-zhyttia",
    name: "Друге Життя",
    city: "Харків",
    address: "просп. Турботи, 4",
    description:
      "Тут тварини отримують шанс почати все знову. Команда волонтерів дбає про здоров'я та адаптацію.",
    imageUrl:
      "https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=720&q=80",
    images: [
      {
        id: "druhe-zhyttia-img-1",
        imageUrl:
          "https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/druhe-zhyttia-1",
      },
    ],
    animalsCount: 27,
    rating: 11,
    phone: "0507654321",
    email: "druhe.zhyttia@gmail.com",
    workingHours: "Пн-Сб 8:00-18:00",
    foundedAt: "2018",
  },
  {
    id: "tepli-lapy",
    name: "Теплі Лапи",
    city: "Одеса",
    address: "вул. Морська, 21",
    description:
      "Невеликий, але дуже дружній притулок, де кожна тварина має свою історію та підтримку.",
    imageUrl:
      "https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?auto=format&fit=crop&w=720&q=80",
    images: [
      {
        id: "tepli-lapy-img-1",
        imageUrl:
          "https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/tepli-lapy-1",
      },
    ],
    animalsCount: 18,
    rating: 4,
    phone: "0931112233",
    email: "tepli.lapy@gmail.com",
    workingHours: "Щодня 10:00-17:00",
    foundedAt: "2019",
  },
  {
    id: "virnyi-druh",
    name: "Вірний Друг",
    city: "Дніпро",
    address: "вул. Дружби, 15",
    description:
      "Притулок для собак, які залишилися без дому. Тут їх готують до життя в сім'ї.",
    imageUrl:
      "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=720&q=80",
    images: [
      {
        id: "virnyi-druh-img-1",
        imageUrl:
          "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/virnyi-druh-1",
      },
    ],
    animalsCount: 31,
    rating: 23,
    phone: "0972223344",
    email: "virnyi.druh@gmail.com",
    workingHours: "Пн-Пт 9:00-18:00",
    foundedAt: "2017",
  },
  {
    id: "kotiachyi-svit",
    name: "Котячий Світ",
    city: "Вінниця",
    address: "вул. Котяча, 6",
    description:
      "Притулок, що опікується котами різного віку. Особлива увага приділяється комфортному утриманню.",
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=720&q=80",
    images: [
      {
        id: "kotiachyi-svit-img-1",
        imageUrl:
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
        publicId: "fallback/kotiachyi-svit-1",
      },
    ],
    animalsCount: 26,
    rating: 1,
    phone: "0669876543",
    email: "kotiachyi.svit@gmail.com",
    workingHours: "Вт-Нд 10:00-18:00",
    foundedAt: "2021",
  },
];
