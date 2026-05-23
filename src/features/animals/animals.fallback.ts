import type { Animal } from "@/src/types/api";

export const FALLBACK_ANIMALS: (Animal & {
  categoryCode: string;
  genderCode: string;
})[] = [
  {
    id: "murczyk",
    name: "Мурчик",
    category: "Кіт",
    categoryCode: "CAT",
    age: "3 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Київ",
    description: "Дружній, любить гратися та обійматися",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинований",
    shelterId: "hvostyky",
    shelterName: "Дім Хвостиків",
    rating: 2,
  },
  {
    id: "luna",
    name: "Луна",
    category: "Кіт",
    categoryCode: "CAT",
    age: "1 рік",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Львів",
    description:
      "Спокійна та лагідна кішка, любить затишок і тихі вечори поруч із господарем.",
    imageUrl:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинована",
    shelterId: "lapky-nadii",
    shelterName: "Лапки Надії",
    rating: 12,
  },
  {
    id: "barni",
    name: "Барні",
    category: "Собака",
    categoryCode: "DOG",
    age: "2 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Харків",
    description:
      "Енергійний та відданий пес, чудово підходить для активної родини та прогулянок.",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинований",
    shelterId: "druhe-zhyttia",
    shelterName: "Друге Життя",
    rating: 5,
  },
  {
    id: "snizhka",
    name: "Сніжка",
    category: "Кіт",
    categoryCode: "CAT",
    age: "2 роки",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Одеса",
    description:
      "Ніжна та обережна кішка, яка потребує трохи часу, щоб довіритися, але дуже ласкава.",
    imageUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Стерилізована",
    shelterId: "tepli-lapy",
    shelterName: "Теплі Лапи",
    rating: 4,
  },
  {
    id: "richi",
    name: "Річі",
    category: "Кіт",
    categoryCode: "CAT",
    age: "2 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Київ",
    description:
      "Активний і допитливий кіт, любить гратися та досліджувати все навколо.",
    imageUrl:
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Здоровий",
    shelterId: "hvostyky",
    shelterName: "Дім Хвостиків",
    rating: 15,
  },
  {
    id: "bonia",
    name: "Боня",
    category: "Собака",
    categoryCode: "DOG",
    age: "0.5 року",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Вінниця",
    description:
      "Спокійна та дуже ніжна собака, ідеально підійде для тихого дому та неспішних прогулянок.",
    imageUrl:
      "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинована",
    shelterId: "kotiachyi-svit",
    shelterName: "Котячий Світ",
    rating: 8,
  },
  {
    id: "archie",
    name: "Арчі",
    category: "Собака",
    categoryCode: "DOG",
    age: "4 роки",
    gender: "Самець",
    genderCode: "MALE",
    city: "Дніпро",
    description:
      "Розумний пес із добрим характером, швидко вчиться і цінує увагу.",
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Вакцинований",
    shelterId: "virnyi-druh",
    shelterName: "Вірний Друг",
    rating: 9,
  },
  {
    id: "mila",
    name: "Міла",
    category: "Кіт",
    categoryCode: "CAT",
    age: "1 рік",
    gender: "Самка",
    genderCode: "FEMALE",
    city: "Київ",
    description: "Грайлива кішка з м'яким характером, добре ладнає з людьми.",
    imageUrl:
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=640&q=80",
    images: [
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=900&q=80",
    ],
    healthStatus: "Здорова",
    shelterId: "hvostyky",
    shelterName: "Дім Хвостиків",
    rating: 7,
  },
];
