/**
 * Year pages under /dokumenty/dotacje/, newest first. One list, used twice:
 * the cards on the Dotacje index, and the `SiblingNav` rail on each year page.
 *
 * `label` doubles as the card title and the rail link text; `text` is the card
 * blurb only.
 */
export const dotacjeYears = [
  {
    href: "/dokumenty/dotacje/2025/",
    label: "Dotacje 2025",
    text: "Dodatek motywacyjny dla pracowników oraz dotacja celowa na wyposażenie Domu.",
  },
  {
    href: "/dokumenty/dotacje/2024/",
    label: "Dotacje 2024",
    text: "Pierwszy rok programu dofinansowania wynagrodzeń w postaci dodatku motywacyjnego.",
  },
  {
    href: "/dokumenty/dotacje/2023/",
    label: "Dotacje 2023",
    text: "Dofinansowanie ze środków rezerwy celowej budżetu państwa na dodatki dla pracowników.",
  },
  {
    href: "/dokumenty/dotacje/2022/",
    label: "Dotacje 2022",
    text: "Środki z Funduszu Przeciwdziałania COVID-19 na dyżury pielęgniarskie.",
  },
  {
    href: "/dokumenty/dotacje/2021/",
    label: "Dotacje 2021",
    text: "Dotacje wojewody i środki covidowe na wyposażenie, kadrę oraz ochronę Mieszkańców.",
  },
  {
    href: "/dokumenty/dotacje/2020/",
    label: "Dotacje 2020",
    text: "Środki na ochronę osobistą, opiekę pielęgniarską i wynagrodzenia w czasie epidemii.",
  },
  {
    href: "/dokumenty/dotacje/2019-2018-2016/",
    label: "Dotacje 2019, 2018 i 2016",
    text: "Wcześniejsze dotacje wojewody na utrzymanie standardów i zakupy inwestycyjne.",
  },
] as const;
