import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { useTermsStore } from '../../store/termsStore';
import { Colors } from '../../theme/colors';
import { FontFamilies, FontSizes } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

const TERMS_VERSION = '2026-05-23';

const sections = [
  {
    title: '1. Phạm vi áp dụng',
    body:
      'Bộ Điều khoản & Chính sách này áp dụng cho khách hàng sử dụng ứng dụng ĐI VIỆT để tìm kiếm, đặt thuê, quản lý chuyến thuê xe, thanh toán và liên hệ hỗ trợ. Trước khi xác nhận giao dịch hoặc ký Hợp đồng thuê xe, Quý khách vui lòng đọc kỹ toàn bộ nội dung dưới đây.',
  },
  {
    title: '2. Chính sách về giấy tờ xe và cam kết trách nhiệm của ĐI VIỆT',
    body:
      'Nhằm bảo đảm an toàn tài sản và quản lý hồ sơ phương tiện của ĐI VIỆT, khi bàn giao xe, ĐI VIỆT cung cấp cho Quý khách bản sao y chứng thực Giấy đăng ký xe (Cà vẹt xe), kèm các giấy tờ hợp lệ khác như Bảo hiểm trách nhiệm dân sự bắt buộc và Giấy chứng nhận kiểm định còn hiệu lực theo hồ sơ bàn giao. ĐI VIỆT không bàn giao Cà vẹt xe bản gốc cho khách hàng trong quá trình thuê xe.\n\nĐI VIỆT hiểu rằng việc sử dụng bản sao y chứng thực có thể khiến Quý khách phát sinh lo ngại khi được cơ quan chức năng kiểm tra. Vì vậy, trong phạm vi lỗi hành chính chỉ liên quan đến việc không mang theo Giấy đăng ký xe bản gốc do ĐI VIỆT không bàn giao bản gốc, ĐI VIỆT cam kết chịu trách nhiệm pháp lý và tài chính đối với khoản phạt phát sinh từ lỗi này.\n\nKhi cơ quan chức năng kiểm tra giấy tờ xe, Quý khách vui lòng thực hiện theo quy trình sau: (i) xuất trình bản sao y chứng thực Cà vẹt xe cùng Hợp đồng thuê xe và các giấy tờ được ĐI VIỆT bàn giao; (ii) nếu cơ quan chức năng vẫn lập biên bản xử phạt đối với lỗi không có Cà vẹt xe bản gốc, Quý khách có thể ký biên bản theo yêu cầu của cơ quan chức năng; (iii) thông báo ngay cho ĐI VIỆT và lưu giữ biên bản, hình ảnh hoặc tài liệu liên quan; (iv) ĐI VIỆT sẽ chủ động phối hợp, mang giấy tờ gốc làm việc với cơ quan chức năng và thanh toán toàn bộ khoản phạt thuộc phạm vi cam kết nêu trên. Quý khách không phải chịu thêm chi phí đối với riêng lỗi này.',
  },
  {
    title: '3. Trách nhiệm của người thuê về an toàn giao thông',
    body:
      'Cam kết tại Mục 2 chỉ áp dụng riêng cho lỗi liên quan đến việc không mang theo Giấy đăng ký xe bản gốc trong trường hợp ĐI VIỆT đã bàn giao bản sao y chứng thực cho Quý khách. Cam kết này không bao gồm các lỗi vi phạm giao thông hoặc nghĩa vụ pháp lý phát sinh từ hành vi điều khiển phương tiện của Quý khách.\n\nTrong suốt thời gian thuê xe, Quý khách là người trực tiếp quản lý và điều khiển phương tiện, vì vậy Quý khách có trách nhiệm tuân thủ đầy đủ quy định pháp luật về giao thông đường bộ, an toàn giao thông, nồng độ cồn, tốc độ, làn đường, tín hiệu giao thông, dừng đỗ, phí cầu đường và các nghĩa vụ liên quan khác. Quý khách chịu toàn bộ trách nhiệm nộp phạt, bồi hoàn thiệt hại và xử lý hậu quả đối với các vi phạm do hành vi lái xe, quản lý xe hoặc sử dụng xe của mình gây ra, bao gồm nhưng không giới hạn ở lỗi chạy quá tốc độ, vượt đèn đỏ, đi sai làn đường, vi phạm nồng độ cồn hoặc sử dụng xe sai mục đích.',
  },
  {
    title: '4. Cơ sở pháp lý và ngôn ngữ',
    body:
      'Tài liệu này được trình bày theo định hướng của Luật Bảo vệ quyền lợi người tiêu dùng 19/2023/QH15. Các nội dung về giao dịch điện tử, dữ liệu cá nhân, khiếu nại và trách nhiệm được xây dựng có tham chiếu Bộ luật Dân sự 91/2015/QH13, Nghị định 13/2023/NĐ-CP, Luật An toàn thông tin mạng 86/2015/QH13 và Nghị định 52/2013/NĐ-CP được sửa đổi bởi Nghị định 85/2021/NĐ-CP.',
  },
  {
    title: '5. Tài khoản và xác thực',
    body:
      'Quý khách chịu trách nhiệm cung cấp thông tin chính xác khi đăng ký, đăng nhập và xác thực giấy tờ. ĐI VIỆT có thể yêu cầu bổ sung thông tin hoặc tạm dừng xử lý giao dịch khi phát hiện dấu hiệu gian dối, thông tin không trùng khớp, rủi ro an toàn hoặc yêu cầu từ cơ quan có thẩm quyền.',
  },
  {
    title: '6. Đặt xe, giá và thanh toán',
    body:
      'Giá thuê, phí phát sinh, điều kiện đặt xe và phương thức thanh toán được hiển thị trước khi Quý khách xác nhận giao dịch. ĐI VIỆT không áp dụng thay đổi giá hồi tố đối với giao dịch đã được xác lập hợp lệ, trừ trường hợp pháp luật bắt buộc hoặc các bên có thỏa thuận riêng rõ ràng.',
  },
  {
    title: '7. Kiểm tra, hủy chuyến và hoàn tiền',
    body:
      'Quý khách có quyền kiểm tra thông tin xe, thời gian thuê, địa điểm nhận trả và các chi phí liên quan trước khi thanh toán. Chính sách hủy chuyến, hoàn tiền hoặc hoàn tiền một phần được xử lý theo trạng thái giao dịch, thời điểm yêu cầu, lỗi phát sinh và chứng cứ do các bên cung cấp. Mọi ngoại lệ phải được thông báo rõ trước thời điểm thanh toán.',
  },
  {
    title: '8. Dữ liệu cá nhân',
    body:
      'ĐI VIỆT chỉ thu thập và xử lý dữ liệu cần thiết cho việc tạo tài khoản, xác thực danh tính, quản lý đơn thuê, thanh toán, hỗ trợ khách hàng, phòng chống gian lận và tuân thủ pháp luật. Quý khách có quyền yêu cầu truy cập, chỉnh sửa, xóa, hạn chế xử lý hoặc rút lại đồng ý theo quy định pháp luật. Các đồng ý không cần thiết cho giao dịch cốt lõi, ví dụ marketing hoặc cá nhân hóa nâng cao, cần được tách riêng.',
  },
  {
    title: '9. Bảo mật và lưu trữ thông tin',
    body:
      'ĐI VIỆT áp dụng biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông tin tài khoản, giấy tờ xác thực, lịch sử thuê xe và dữ liệu thanh toán. Thời hạn lưu trữ phụ thuộc mục đích xử lý, nghĩa vụ pháp lý, yêu cầu giải quyết tranh chấp và yêu cầu lưu trữ giao dịch theo pháp luật thương mại điện tử.',
  },
  {
    title: '10. Sở hữu trí tuệ',
    body:
      'Tên gọi ĐI VIỆT, giao diện ứng dụng, cơ sở dữ liệu, nội dung, hình ảnh, thiết kế và phần mềm thuộc quyền sở hữu hoặc quyền sử dụng hợp pháp của ĐI VIỆT và bên cấp phép. Quý khách không được sao chép, sửa đổi, khai thác thương mại hoặc tạo sản phẩm phái sinh nếu chưa có chấp thuận bằng văn bản của ĐI VIỆT.',
  },
  {
    title: '11. Khiếu nại và tranh chấp',
    body:
      'Quý khách có thể gửi khiếu nại qua trung tâm hỗ trợ trong ứng dụng, hotline hoặc email chăm sóc khách hàng. ĐI VIỆT xác nhận tiếp nhận trong thời gian hợp lý và bắt đầu xử lý hoặc thương lượng không muộn hơn 07 ngày làm việc kể từ khi nhận đủ thông tin. Nếu tranh chấp không thể giải quyết bằng thương lượng, Quý khách có quyền lựa chọn cơ chế giải quyết theo quy định pháp luật Việt Nam.',
  },
  {
    title: '12. Xác nhận của khách hàng',
    body:
      'Bằng việc xác nhận trên ứng dụng hoặc ký vào Hợp đồng thuê xe, Quý khách xác nhận đã đọc, hiểu rõ và đồng ý với toàn bộ Điều khoản & Chính sách của ĐI VIỆT, bao gồm các cam kết, giới hạn trách nhiệm và nghĩa vụ của Quý khách trong quá trình sử dụng dịch vụ.',
  },
];

export const TermsPolicyScreen: React.FC = () => {
  const { email } = useAuthStore();
  const getAcceptance = useTermsStore((state) => state.getAcceptance);
  const acceptTerms = useTermsStore((state) => state.acceptTerms);
  const acceptance = useTermsStore((state) => state.acceptancesByUser[email || 'guest']);
  const currentAcceptance = useMemo(
    () => acceptance ?? getAcceptance(email),
    [acceptance, email, getAcceptance]
  );
  const [checked, setChecked] = useState(currentAcceptance.accepted);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentAcceptance.accepted) {
      setChecked(true);
    }
  }, [currentAcceptance.accepted]);

  const handleAccept = async () => {
    if (!checked) {
      Alert.alert(
        'Chưa xác nhận',
        'Vui lòng đánh dấu xác nhận đã đọc và đồng ý với Điều khoản & Chính sách.'
      );
      return;
    }

    try {
      setIsSaving(true);
      await acceptTerms(email || 'guest', TERMS_VERSION);
      Alert.alert('Đã ghi nhận', 'ĐI VIỆT đã lưu xác nhận đồng ý của bạn.');
    } catch {
      Alert.alert('Không thể lưu', 'Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, Shadow.card]}>
          <View style={styles.headerIcon}>
            <Image
              source={require('../../../assets/favicon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Điều khoản & Chính sách của ĐI VIỆT</Text>
          <Text style={styles.meta}>Ngày ban hành: {TERMS_VERSION}</Text>
          {currentAcceptance.accepted && (
            <View style={styles.acceptedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primaryContainer} />
              <Text style={styles.acceptedText}>
                Đã đồng ý {currentAcceptance.acceptedAt ? new Date(currentAcceptance.acceptedAt).toLocaleDateString('vi-VN') : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.documentCard, Shadow.card]}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          ))}

          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primaryContainer} />
            <Text style={styles.noteText}>
              Quý khách hàng vui lòng đọc kỹ Điều khoản & Chính sách trước khi xác nhận đồng ý. Việc đồng ý sẽ được lưu lại và áp dụng cho tất cả các giao dịch thuê xe trong tương lai của bạn với ĐI VIỆT. Nếu có bất kỳ thắc mắc nào về nội dung, vui lòng liên hệ trung tâm hỗ trợ của chúng tôi để được giải đáp.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, Shadow.bottomNav]}>
        <TouchableOpacity
          style={styles.checkRow}
          activeOpacity={0.75}
          onPress={() => setChecked((value) => !value)}
        >
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Ionicons name="checkmark" size={16} color={Colors.onPrimary} />}
          </View>
          <Text style={styles.checkText}>
            Tôi đã đọc và đồng ý với Điều khoản & Chính sách của ĐI VIỆT.
          </Text>
        </TouchableOpacity>
        <Button
          title={currentAcceptance.accepted ? 'Cập nhật xác nhận đồng ý' : 'Đồng ý điều khoản'}
          onPress={handleAccept}
          isLoading={isSaving}
          disabled={!checked}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding,
    paddingBottom: Spacing.containerVerticalPadding + 156,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: Spacing.stackMd,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerLogo: {
    width: 75,
    height: 75,
  },
  title: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.h2Semibold,
    color: Colors.onSurface,
    lineHeight: 28,
  },
  meta: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryFixed,
  },
  acceptedText: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.labelSm,
    color: Colors.primaryContainer,
  },
  documentCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 18,
  },
  section: {
    paddingBottom: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  sectionTitle: {
    fontFamily: FontFamilies.sansSemiBold,
    fontSize: FontSizes.bodySemibold,
    color: Colors.onSurface,
    marginBottom: 8,
    lineHeight: 20,
  },
  body: {
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurfaceVariant,
    lineHeight: 21,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: Radius.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
  },
  noteText: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.labelSm,
    color: Colors.onSurfaceVariant,
    lineHeight: 17,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerVerticalPadding / 2,
    paddingBottom: Spacing.containerVerticalPadding + Spacing.xs,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  checkText: {
    flex: 1,
    fontFamily: FontFamilies.sansRegular,
    fontSize: FontSizes.bodyMain,
    color: Colors.onSurface,
    lineHeight: 20,
  },
});
