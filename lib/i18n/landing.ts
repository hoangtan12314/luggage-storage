import type { LandingCopy, Locale } from "./types";

const en: LandingCopy = {
  meta: {
    title:
      "Ngõ Saigon — Cooking Classes, Rooms & Luggage Storage in District 1",
    description:
      "A homestay in the heart of District 1, Ho Chi Minh City: hands-on Vietnamese cooking classes, private rooms by the night, and secure luggage storage by the hour, day, or week.",
  },
  nav: {
    cooking: "Cooking Classes",
    rooms: "Rooms",
    luggage: "Luggage Storage",
    bookNow: "Book now",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    eyebrow: "Ngõ Saigon",
    h1: "Experience Saigon Your Way",
    h1Mobile: "Ngõ Saigon",
    tagline: "Stay · Store · Experience",
    description:
      "Discover the local side of Saigon through hands-on Vietnamese workshops, cozy homestay experiences, and convenient luggage storage in the heart of the city.",
    descriptionMobile:
      "A homestay, secure luggage storage, and hands-on Vietnamese food experiences in District 1.",
    learnMore: "Learn more",
    exploreCta: "Explore our services",
    imageAlt:
      "Two smiling guests in Ngõ Saigon aprons holding Vietnamese coffee filters in a cooking class",
  },
  footer: {
    since: "Since {year}",
    rights: "All rights reserved.",
    campuses: "Our campuses",
    follow: "Follow us",
    opensNewTab: "opens in a new tab",
  },
  campuses: {
    notes: {
      "campus-1": "Cooking classes",
      "campus-2": "Rooms & luggage storage",
    },
  },
  services: {
    cooking: {
      title: "Workshops & Experiences",
      blurb: "Learn to make Vietnamese coffee, bánh mì and more.",
      cta: "Explore classes",
      imageAlt:
        "Bánh mì ingredients and a Vietnamese coffee set laid out for a cooking class",
    },
    rooms: {
      title: "Accommodation",
      blurb: "A comfortable stay in the heart of Saigon.",
      cta: "Book a room",
      imageAlt: "A bright private room with a double bed and a balcony door",
    },
    luggage: {
      title: "Luggage Storage",
      blurb: "Explore Saigon hands-free.",
      cta: "Store your bags",
      imageAlt: "A suitcase standing in a tidy room",
    },
  },
};

const vi: LandingCopy = {
  meta: {
    title: "Ngõ Saigon — Lớp Nấu Ăn, Phòng Nghỉ & Gửi Hành Lý Quận 1",
    description:
      "Homestay ngay trung tâm Quận 1, TP.HCM: lớp nấu ăn Việt Nam thực hành, phòng riêng theo đêm, và dịch vụ gửi giữ hành lý an toàn theo giờ, ngày hoặc tuần.",
  },
  nav: {
    cooking: "Lớp Nấu Ăn",
    rooms: "Phòng Nghỉ",
    luggage: "Gửi Hành Lý",
    bookNow: "Đặt ngay",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
  },
  hero: {
    eyebrow: "Ngõ Saigon",
    h1: "Trải Nghiệm Sài Gòn Theo Cách Của Bạn",
    h1Mobile: "Ngõ Saigon",
    tagline: "Ở · Gửi · Trải nghiệm",
    description:
      "Khám phá Sài Gòn bản địa qua các lớp học ẩm thực Việt, homestay ấm cúng và dịch vụ gửi hành lý tiện lợi ngay giữa lòng thành phố.",
    descriptionMobile:
      "Homestay, gửi hành lý an toàn và các trải nghiệm ẩm thực Việt Nam ngay tại Quận 1.",
    learnMore: "Tìm hiểu thêm",
    exploreCta: "Khám phá dịch vụ",
    imageAlt:
      "Hai vị khách mỉm cười, mặc tạp dề Ngõ Saigon, cầm phin cà phê Việt trong lớp nấu ăn",
  },
  footer: {
    since: "Từ năm {year}",
    rights: "Bảo lưu mọi quyền.",
    campuses: "Các cơ sở",
    follow: "Theo dõi chúng tôi",
    opensNewTab: "mở trong tab mới",
  },
  campuses: {
    notes: {
      "campus-1": "Lớp nấu ăn",
      "campus-2": "Phòng nghỉ & gửi hành lý",
    },
  },
  services: {
    cooking: {
      title: "Lớp Học & Trải Nghiệm",
      blurb: "Học pha cà phê Việt, làm bánh mì và nhiều món khác.",
      cta: "Xem lớp học",
      imageAlt:
        "Nguyên liệu bánh mì và bộ pha cà phê Việt được bày sẵn cho một lớp nấu ăn",
    },
    rooms: {
      title: "Lưu Trú",
      blurb: "Chỗ nghỉ thoải mái giữa lòng Sài Gòn.",
      cta: "Đặt phòng",
      imageAlt: "Phòng riêng sáng sủa với giường đôi và cửa ra ban công",
    },
    luggage: {
      title: "Gửi Hành Lý",
      blurb: "Thong dong khám phá Sài Gòn.",
      cta: "Gửi hành lý",
      imageAlt: "Một chiếc vali đặt trong căn phòng gọn gàng",
    },
  },
};

export const landingCopy: Record<Locale, LandingCopy> = { en, vi };
