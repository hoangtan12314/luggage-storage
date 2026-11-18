import type { ClassesCopy, Locale } from "./types";

const en: ClassesCopy = {
  meta: {
    title: "Cooking Classes — Coming Soon | Ngõ Saigon",
    description:
      "Hands-on Vietnamese cooking classes at Ngõ Saigon, District 1 — online booking is coming soon.",
  },
  h1: "Cooking classes are coming soon",
  body: "We are getting our hands-on Vietnamese cooking classes ready for online booking. In the meantime, call or message us and we will happily arrange a class for you.",
  cta: "Call us",
};

const vi: ClassesCopy = {
  meta: {
    title: "Lớp Nấu Ăn — Sắp Ra Mắt | Ngõ Saigon",
    description:
      "Lớp nấu ăn Việt Nam thực hành tại Ngõ Saigon, Quận 1 — đặt lớp trực tuyến sắp ra mắt.",
  },
  h1: "Lớp nấu ăn sắp ra mắt",
  body: "Chúng tôi đang chuẩn bị mở đặt lớp nấu ăn Việt Nam trực tuyến. Trong lúc chờ đợi, hãy gọi hoặc nhắn tin cho chúng tôi để được sắp xếp một lớp học cho bạn.",
  cta: "Gọi cho chúng tôi",
};

export const classesCopy: Record<Locale, ClassesCopy> = { en, vi };
