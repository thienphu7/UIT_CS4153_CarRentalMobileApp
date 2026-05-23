import { Car } from '../api/car.api';

const VIETNAMESE_DESCRIPTIONS: Record<string, string> = {
  'Mid-size sedan with good fuel efficiency.': 'Sedan cỡ trung tiết kiệm nhiên liệu, phù hợp cho di chuyển hằng ngày.',
  'Spacious SUV, perfect for families.': 'SUV rộng rãi, phù hợp cho gia đình và các chuyến đi dài.',
  'Powerful off-road pickup truck.': 'Bán tải mạnh mẽ, phù hợp cho địa hình khó và nhu cầu chở đồ.',
  'Reliable compact sedan with modern features.': 'Sedan nhỏ gọn, bền bỉ và được trang bị các tính năng hiện đại.',
  'Comfortable and efficient crossover SUV.': 'SUV crossover thoải mái, vận hành hiệu quả và linh hoạt trong đô thị.',
  'Luxury full-size SUV with premium features.': 'SUV cỡ lớn hạng sang với nhiều trang bị cao cấp.',
  'Spacious minivan with sliding doors.': 'MPV rộng rãi với cửa trượt tiện dụng cho gia đình và nhóm đông người.',
  'Sporty and luxurious SUV coupe.': 'SUV coupe sang trọng, thiết kế thể thao và cảm giác lái linh hoạt.',
  'High-performance luxury SUV.': 'SUV hạng sang hiệu năng cao, mạnh mẽ và tiện nghi.',
  'Compact and fuel-efficient daily driver.': 'Xe nhỏ gọn, tiết kiệm nhiên liệu, phù hợp sử dụng hằng ngày.',
  'Luxury compact SUV with advanced features.': 'SUV hạng sang nhỏ gọn với nhiều công nghệ hỗ trợ hiện đại.',
  'Versatile family SUV with modern styling.': 'SUV gia đình đa dụng, thiết kế hiện đại và không gian linh hoạt.',
  'Compact MPV with 7-seat configuration.': 'MPV nhỏ gọn với cấu hình 7 chỗ, phù hợp cho gia đình.',
  'Efficient and stylish urban SUV.': 'SUV đô thị phong cách, vận hành hiệu quả và dễ sử dụng.',
  'Sleek European sedan with luxury interior.': 'Sedan châu Âu thanh lịch với khoang nội thất sang trọng.',
  'Hypercar with extreme performance and rarity.': 'Hypercar hiếm gặp với hiệu năng vượt trội và thiết kế nổi bật.',
  'Stylish hatchback with sporty handling.': 'Hatchback phong cách, nhỏ gọn và có cảm giác lái thể thao.',
  'Popular crossover with premium features.': 'Crossover được ưa chuộng với nhiều trang bị tiện nghi.',
  'Iconic roadster with top-down driving fun.': 'Roadster biểu tượng, mang lại trải nghiệm lái mui trần phấn khích.',
  'Luxury sedan with elegant design.': 'Sedan hạng sang với thiết kế thanh lịch và tiện nghi cao cấp.',
  'Ultra-luxury sedan with handcrafted excellence.': 'Sedan siêu sang với độ hoàn thiện thủ công tinh xảo.',
  'Comfortable and reliable family sedan.': 'Sedan gia đình thoải mái, bền bỉ và dễ sử dụng.',
  'Popular 7-seater MPV for group travel.': 'MPV 7 chỗ phổ biến, phù hợp cho gia đình và nhóm du lịch.',
  'Electric SUV with modern Vietnamese design.': 'SUV điện với thiết kế Việt Nam hiện đại và thân thiện môi trường.',
  'Stylish electric SUV with cutting-edge tech.': 'SUV điện phong cách với nhiều công nghệ tiên tiến.',
  'French SUV with modern design and comfort.': 'SUV Pháp với thiết kế hiện đại, không gian thoải mái và tiện nghi.',
  'High-performance luxury SUV from Porsche.': 'SUV hạng sang hiệu năng cao của Porsche, mạnh mẽ và tinh tế.',
  'Electric sports car with stunning acceleration.': 'Xe thể thao điện với khả năng tăng tốc ấn tượng.',
  'Luxury SUV with sporty handling and design.': 'SUV hạng sang với thiết kế thể thao và cảm giác lái chắc chắn.',
  'Compact luxury SUV with sleek lines.': 'SUV hạng sang nhỏ gọn với đường nét thiết kế tinh tế.',
  'Elegant Scandinavian sedan with luxury and safety.': 'Sedan Scandinavia thanh lịch, chú trọng sự an toàn và tiện nghi.',
  'Compact hatchback ideal for city driving.': 'Hatchback nhỏ gọn, lý tưởng cho di chuyển trong thành phố.',
  'Luxury sports sedan with high-end performance.': 'Sedan thể thao hạng sang với hiệu năng cao và trang bị cao cấp.',
};

export const getCarDescription = (car: Pick<Car, 'description' | 'brand' | 'model' | 'carType'>) => {
  const description = car.description?.trim();
  if (!description) return `${car.brand} ${car.model} là mẫu ${car.carType} phù hợp cho nhu cầu thuê xe linh hoạt.`;
  return VIETNAMESE_DESCRIPTIONS[description] ?? description;
};
