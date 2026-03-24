export type StoreItem = {
  id: string;
  title: string;
  price: number;
  emoji: string;
  description: string;
};

export const storeItems: StoreItem[] = [
  {
    id: "hat",
    title: "Капелюх мудреця",
    price: 20,
    emoji: "🎩",
    description: "Додає стилю під час розв'язання прикладів.",
  },
  {
    id: "wand",
    title: "Чарівна паличка",
    price: 35,
    emoji: "🪄",
    description: "Для справжніх математичних магів.",
  },
  {
    id: "medal",
    title: "Медаль чемпіона",
    price: 50,
    emoji: "🏅",
    description: "Пам'ятка про твої досягнення.",
  },
  {
    id: "pet",
    title: "Міні-котик",
    price: 75,
    emoji: "🐾",
    description: "Вірний помічник у навчанні.",
  },
];
