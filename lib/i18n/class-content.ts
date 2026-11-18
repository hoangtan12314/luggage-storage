import type { Workshop } from "../config";
import type { Locale } from "./types";

/**
 * The translatable class text for one workshop. English is the owner's data
 * in lib/config.ts (the source of truth); this file holds the Vietnamese
 * translation, keyed by class type. Names and addresses are deliberately not
 * translated — they are proper nouns shown as supplied.
 *
 * TODO: draft translation, to be reviewed by the owner.
 */
export type ClassText = Pick<
  Workshop,
  "highlights" | "description" | "includes" | "excludes" | "notSuitableFor"
>;

const VI_COFFEE: ClassText = {
  highlights: [
    "Tự tay làm bánh mì Việt Nam và 4 loại cà phê truyền thống cùng hướng dẫn viên bản địa",
    "Khám phá câu chuyện đằng sau ẩm thực Việt Nam và ảnh hưởng của người Pháp",
    "Trực tiếp chế biến bằng nguyên liệu truyền thống và công thức địa phương",
    "Tìm hiểu hương vị và ý nghĩa văn hóa của cà phê Việt Nam và món ăn đường phố",
    "Nhận toàn bộ công thức như một món quà để làm lại tại nhà",
  ],
  description:
    "Học cách làm cà phê và bánh mì Việt Nam đích thực trong buổi workshop thực hành do các chuyên gia địa phương hướng dẫn. Khám phá lịch sử và ý nghĩa văn hóa của hai món ăn biểu tượng bậc nhất Việt Nam, đồng thời tự tay tạo ra và thưởng thức thành quả của chính mình.",
  includes: [
    "Hướng dẫn viên bản địa và barista hướng dẫn",
    "Toàn bộ nguyên liệu và dụng cụ để làm cà phê và bánh mì",
    "Trải nghiệm tự tay làm bánh mì Việt Nam và 4 loại cà phê truyền thống",
    "Thưởng thức tất cả các món cà phê bạn pha và chiếc bánh mì tự làm",
    "Lớp học nhóm nhỏ với những câu chuyện văn hóa và phần hỏi đáp",
    "Toàn bộ công thức được gửi tặng sau buổi học",
    "Có lựa chọn món chay theo yêu cầu",
  ],
  excludes: ["Phương tiện di chuyển đến buổi học"],
  notSuitableFor: ["Trẻ em dưới 6 tuổi", "Người trên 95 tuổi"],
};

const VI_COCOA: ClassText = {
  highlights: [
    "Tự tay làm bánh mì Việt Nam và 4 loại thức uống ca cao truyền thống cùng hướng dẫn viên bản địa",
    "Khám phá câu chuyện đằng sau ẩm thực Việt Nam và ảnh hưởng của người Pháp",
    "Tìm hiểu hương vị và ý nghĩa văn hóa của ca cao Việt Nam và món ăn đường phố",
    "Nhận toàn bộ công thức như một món quà để làm lại tại nhà",
  ],
  description:
    "Học cách làm thức uống ca cao và bánh mì Việt Nam đích thực trong buổi workshop thực hành do các chuyên gia địa phương hướng dẫn. Khám phá lịch sử và ý nghĩa văn hóa của ca cao Việt Nam cùng một trong những món ăn biểu tượng của đất nước, đồng thời tự tay tạo ra và thưởng thức thành quả của chính mình.",
  includes: [
    "Hướng dẫn viên bản địa và barista hướng dẫn",
    "Toàn bộ nguyên liệu và dụng cụ để làm ca cao và bánh mì",
    "Trải nghiệm tự tay làm bánh mì Việt Nam và 4 loại thức uống ca cao truyền thống",
    "Thưởng thức tất cả các món ca cao bạn pha và chiếc bánh mì tự làm",
    "Lớp học nhóm nhỏ với những câu chuyện văn hóa và phần hỏi đáp",
    "Toàn bộ công thức được gửi tặng sau buổi học",
    "Có lựa chọn món chay theo yêu cầu",
  ],
  excludes: ["Phương tiện di chuyển đến buổi học"],
  notSuitableFor: ["Trẻ em dưới 6 tuổi", "Người trên 95 tuổi"],
};

const VI_SPRING_ROLL: ClassText = {
  highlights: [
    "Tự tay cuốn gỏi cuốn Việt Nam tươi trong lớp học thực hành",
    "Làm chủ 3 loại nước chấm Việt Nam huyền thoại cùng sự hướng dẫn của chuyên gia",
    "Lớp học nhỏ, thân mật, mỗi người đều được hướng dẫn trực tiếp",
    "Khám phá một góc nhỏ Sài Gòn mang không khí ngõ nhỏ ấm cúng của Hà Nội",
  ],
  description:
    "Bước vào Ngõ Saigon, một góc nhỏ ấm cúng ở Sài Gòn lấy cảm hứng từ những con ngõ ẩn mình của Hà Nội, cho trải nghiệm bữa tối thực hành không dùng lửa. Bắt đầu bằng việc làm quen với rau thơm tươi, rau củ giòn, bún gạo mềm và các loại đạm đã chế biến sẵn được chọn lọc kỹ để cuốn nên những chiếc gỏi cuốn Việt Nam hoàn hảo. Dưới sự hướng dẫn của người hướng dẫn, bạn sẽ học cách chuẩn bị gỏi cuốn tươi và làm chủ ba loại nước chấm huyền thoại.",
  includes: [
    "Đồ uống chào đón: mojito kiểu Việt Nam",
    "Hướng dẫn thực hành cách làm gỏi cuốn Việt Nam",
    "Toàn bộ nguyên liệu tươi: rau thơm, rau củ, bún, đạm đã chế biến sẵn",
    "Hướng dẫn làm chủ ba loại nước chấm huyền thoại",
    "Cung cấp dụng cụ nấu ăn",
    "Nhóm nhỏ, được quan tâm riêng",
    "Hộp mang về nếu bạn không ăn hết phần cuốn của mình",
  ],
};

const VI: Record<Workshop["icon"], ClassText> = {
  coffee: VI_COFFEE,
  cocoa: VI_COCOA,
  "spring-roll": VI_SPRING_ROLL,
};

/**
 * The class text in the requested language. Plain strings only, so the result
 * can be passed from Server Components into client components.
 */
export function localizeWorkshop(workshop: Workshop, locale: Locale): ClassText {
  if (locale === "vi") return VI[workshop.icon];
  return {
    highlights: workshop.highlights,
    description: workshop.description,
    includes: workshop.includes,
    excludes: workshop.excludes,
    notSuitableFor: workshop.notSuitableFor,
  };
}
