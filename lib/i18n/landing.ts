import type { LandingCopy, Locale } from "./types";

const en: LandingCopy = {
  meta: {
    title: "Ngõ Saigon Homestay — Rooms & Luggage Storage in District 1",
    description:
      "A homestay in the heart of District 1, Ho Chi Minh City: private rooms by the night, and secure luggage storage by the hour, day, or week.",
  },
  hero: {
    h1: "Ngõ Saigon Homestay",
    tagline:
      "A private room to stay, or a locker to drop your bags — both in the heart of District 1, walking distance from Ben Thanh Market and Bui Vien.",
  },
  services: {
    luggage: {
      title: "Luggage Storage",
      blurb:
        "Secure, monitored lockers by the hour, day, or week. Drop your bags and go explore.",
      cta: "Book a locker",
      priceFrom: "from 10,000 ₫",
    },
    rooms: {
      title: "Room Booking",
      blurb:
        "A private ensuite room, a few steps from the luggage counter. Quiet, air-conditioned.",
      cta: "Book a room",
      priceFrom: "from 450,000 ₫ / night",
    },
  },
};

const vi: LandingCopy = {
  meta: {
    title: "Ngõ Saigon Homestay — Phòng Nghỉ & Gửi Hành Lý Quận 1",
    description:
      "Homestay ngay trung tâm Quận 1, TP.HCM: phòng riêng theo đêm, và dịch vụ gửi giữ hành lý an toàn theo giờ, ngày hoặc tuần.",
  },
  hero: {
    h1: "Ngõ Saigon Homestay",
    tagline:
      "Một phòng riêng để nghỉ ngơi, hoặc một tủ để gửi hành lý — cả hai đều ngay trung tâm Quận 1, chỉ vài phút đi bộ từ Chợ Bến Thành và phố đi bộ Bùi Viện.",
  },
  services: {
    luggage: {
      title: "Gửi Hành Lý",
      blurb:
        "Tủ gửi đồ an toàn, có giám sát, theo giờ, ngày hoặc tuần. Gửi hành lý và đi khám phá.",
      cta: "Đặt tủ gửi đồ",
      priceFrom: "chỉ từ 10.000 ₫",
    },
    rooms: {
      title: "Đặt Phòng",
      blurb:
        "Phòng riêng có nhà vệ sinh khép kín, ngay gần quầy gửi hành lý. Yên tĩnh, có máy lạnh.",
      cta: "Đặt phòng",
      priceFrom: "chỉ từ 450.000 ₫ / đêm",
    },
  },
};

export const landingCopy: Record<Locale, LandingCopy> = { en, vi };
