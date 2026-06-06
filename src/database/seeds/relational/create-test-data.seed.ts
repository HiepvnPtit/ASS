import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { NguoiDung } from '../../../entities/nguoi-dung.entity';
import { KhachHang } from '../../../entities/khach-hang.entity';
import { TaiXe } from '../../../entities/tai-xe.entity';
import { LoaiXe } from '../../../entities/loai-xe.entity';
import { BangGia } from '../../../entities/bang-gia.entity';
import { Xe } from '../../../entities/xe.entity';
import { ChuyenDi } from '../../../entities/chuyen-di.entity';
import { KhieuNai } from '../../../entities/khieu-nai.entity';

export const createTestDataSeed = async (dataSource: DataSource) => {
  const logger = new Logger('CreateTestDataSeed');

  try {
    // Repositories
    const nguoiDungRepo = dataSource.getRepository(NguoiDung);
    const khachHangRepo = dataSource.getRepository(KhachHang);
    const taiXeRepo = dataSource.getRepository(TaiXe);
    const loaiXeRepo = dataSource.getRepository(LoaiXe);
    const bangGiaRepo = dataSource.getRepository(BangGia);
    const xeRepo = dataSource.getRepository(Xe);
    const chuyenDiRepo = dataSource.getRepository(ChuyenDi);
    const khieuNaiRepo = dataSource.getRepository(KhieuNai);

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // ──────────────────────────────────────────────
    // 1. VEHICLE TYPE (LoaiXe)
    // ──────────────────────────────────────────────
    let loaiXe = await loaiXeRepo.findOne({ where: { ma: 'LX_SEDAN' } });
    if (!loaiXe) {
      loaiXe = loaiXeRepo.create({
        ma: 'LX_SEDAN',
        soCho: 4,
        hopSo: 'AUTOMATIC',
        phanKhuc: 'SEDAN',
      });
      loaiXe = await loaiXeRepo.save(loaiXe);
      logger.log('✅ Created vehicle type: Sedan');
    }

    // ──────────────────────────────────────────────
    // 2. CUSTOMERS (NguoiDung + KhachHang)
    // ──────────────────────────────────────────────
    const customersData = [
      {
        id: 'KH_TEST_001',
        maNguoiDung: 'ND_KH_001',
        hoTen: 'Nguyễn Văn An',
        soDienThoai: '0912345671',
        email: 'khachhang1@test.com',
      },
      {
        id: 'KH_TEST_002',
        maNguoiDung: 'ND_KH_002',
        hoTen: 'Trần Thị Bình',
        soDienThoai: '0912345672',
        email: 'khachhang2@test.com',
      },
      {
        id: 'KH_TEST_003',
        maNguoiDung: 'ND_KH_003',
        hoTen: 'Lê Văn Cường',
        soDienThoai: '0912345673',
        email: 'khachhang3@test.com',
      },
    ];

    const savedCustomers: NguoiDung[] = [];
    for (const c of customersData) {
      let user = await nguoiDungRepo.findOne({
        where: { maNguoiDung: c.maNguoiDung },
      });
      if (!user) {
        user = nguoiDungRepo.create({
          maNguoiDung: c.maNguoiDung,
          ma: c.maNguoiDung,
          hoTen: c.hoTen,
          soDienThoai: c.soDienThoai,
          email: c.email,
          matKhau: hashedPassword,
          vaiTro: 'CUSTOMER',
          trangThai: 'ACTIVE',
        });
        user = await nguoiDungRepo.save(user);
        logger.log(
          `✅ Created customer user: ${c.hoTen} (${c.email} / Test@123)`,
        );
      }

      // Create KhachHang record
      let khachHang = await khachHangRepo.findOne({
        where: { nguoiDung: { maNguoiDung: c.maNguoiDung } },
      });
      if (!khachHang) {
        khachHang = khachHangRepo.create({
          ma: c.id,
          nguoiDung: user,
          diaChiMacDinh: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          ghiChu: `Customer test ${c.id}`,
        });
        await khachHangRepo.save(khachHang);
        logger.log(`✅ Created customer profile: ${c.id}`);
      }

      savedCustomers.push(user);
    }

    // ──────────────────────────────────────────────
    // 3. DRIVERS (NguoiDung + TaiXe)
    // ──────────────────────────────────────────────
    const driversData = [
      {
        id: 'TX_TEST_001',
        maNguoiDung: 'ND_TX_001',
        hoTen: 'Phạm Văn Dũng',
        soDienThoai: '0987654321',
        email: 'taixe1@test.com',
        soGPLX: 'A123456',
        cccd: '123456789012',
      },
      {
        id: 'TX_TEST_002',
        maNguoiDung: 'ND_TX_002',
        hoTen: 'Hoàng Thị Em',
        soDienThoai: '0987654322',
        email: 'taixe2@test.com',
        soGPLX: 'A123457',
        cccd: '123456789013',
      },
    ];

    const savedDrivers: NguoiDung[] = [];
    for (const d of driversData) {
      let user = await nguoiDungRepo.findOne({
        where: { maNguoiDung: d.maNguoiDung },
      });
      if (!user) {
        user = nguoiDungRepo.create({
          maNguoiDung: d.maNguoiDung,
          ma: d.maNguoiDung,
          hoTen: d.hoTen,
          soDienThoai: d.soDienThoai,
          email: d.email,
          matKhau: hashedPassword,
          vaiTro: 'DRIVER',
          trangThai: 'ACTIVE',
        });
        user = await nguoiDungRepo.save(user);
        logger.log(
          `✅ Created driver user: ${d.hoTen} (${d.email} / Test@123)`,
        );
      }

      let taiXe = await taiXeRepo.findOne({
        where: { nguoiDung: { maNguoiDung: d.maNguoiDung } },
      });
      if (!taiXe) {
        taiXe = taiXeRepo.create({
          ma: d.id,
          nguoiDung: user,
          soGiayPhepLaiXe: d.soGPLX,
          canCuocCongDan: d.cccd,
          hanGiayPhepLaiXe: new Date('2028-12-31'),
          diemDanhGia: '4.50',
          trangThaiHoatDong: 'OFFLINE',
          trangThaiXacThuc: 'VERIFIED',
        });
        await taiXeRepo.save(taiXe);
        logger.log(`✅ Created driver profile: ${d.id}`);
      }

      savedDrivers.push(user);
    }

    // ──────────────────────────────────────────────
    // 4. PRICE TABLE (BangGia)
    // ──────────────────────────────────────────────
    let bangGia = await bangGiaRepo.findOne({ where: { ma: 'BG_NOITHANH' } });
    if (!bangGia) {
      bangGia = bangGiaRepo.create({
        ma: 'BG_NOITHANH',
        loaiXe: loaiXe,
        maLoaiXe: loaiXe.maLoaiXe,
        khuVuc: 'Nội thành TP.HCM',
        khungGio: '00:00-23:59',
        giaCoBan: '10000',
        giaTheoKm: '12000',
        ngayApDung: new Date('2026-01-01'),
        hieuLucTu: new Date('2026-01-01'),
      });
      bangGia = await bangGiaRepo.save(bangGia);
      logger.log('✅ Created price table: Nội thành TP.HCM');
    }

    // ──────────────────────────────────────────────
    // 5. VEHICLE (Xe)
    // ──────────────────────────────────────────────
    const khachHang1 = await khachHangRepo.findOne({
      where: { nguoiDung: { maNguoiDung: 'ND_KH_001' } },
      relations: ['nguoiDung'],
    });

    let xe = await xeRepo.findOne({ where: { ma: 'XE_SEDAN_01' } });
    if (!xe && khachHang1) {
      xe = xeRepo.create({
        ma: 'XE_SEDAN_01',
        khachHang: khachHang1,
        loaiXe: loaiXe,
        bienSo: '51A-99999',
        hangXe: 'Toyota',
        dongXe: 'Vios',
        mauXe: 'Bạc',
        cauTrucSangSo: 'AUTOMATIC',
      });
      xe = await xeRepo.save(xe);
      logger.log('✅ Created vehicle: Toyota Vios (51A-99999)');
    }

    // ──────────────────────────────────────────────
    // 6. TRIPS (ChuyenDi)
    // ──────────────────────────────────────────────
    const taiXe1 = await taiXeRepo.findOne({
      where: { nguoiDung: { maNguoiDung: 'ND_TX_001' } },
      relations: ['nguoiDung'],
    });
    const taiXe2 = await taiXeRepo.findOne({
      where: { nguoiDung: { maNguoiDung: 'ND_TX_002' } },
      relations: ['nguoiDung'],
    });
    const khachHang2 = await khachHangRepo.findOne({
      where: { nguoiDung: { maNguoiDung: 'ND_KH_002' } },
      relations: ['nguoiDung'],
    });
    const khachHang3 = await khachHangRepo.findOne({
      where: { nguoiDung: { maNguoiDung: 'ND_KH_003' } },
      relations: ['nguoiDung'],
    });

    const tripsData = [
      {
        ma: 'CD_TEST_001',
        khachHang: khachHang1,
        taiXe: taiXe1,
        xe: xe!,
        bangGia: bangGia,
        diemDon: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        diemDen: '456 Lê Lợi, Quận 1, TP.HCM',
        giaUocTinh: '85000',
        giaThucTe: '95000',
        trangThai: 'COMPLETED',
        quangDuongKm: 5.2,
      },
      {
        ma: 'CD_TEST_002',
        khachHang: khachHang2,
        taiXe: taiXe1,
        xe: xe!,
        bangGia: bangGia,
        diemDon: '789 Võ Văn Tần, Quận 3, TP.HCM',
        diemDen: '12 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
        giaUocTinh: '120000',
        giaThucTe: '135000',
        trangThai: 'COMPLETED',
        quangDuongKm: 8.5,
      },
      {
        ma: 'CD_TEST_003',
        khachHang: khachHang3,
        taiXe: taiXe2,
        xe: xe!,
        bangGia: bangGia,
        diemDon: '1 Lê Duẩn, Quận 1, TP.HCM',
        diemDen: '50 Nguyễn Văn Linh, Quận 7, TP.HCM',
        giaUocTinh: '150000',
        trangThai: 'REQUESTED',
        quangDuongKm: 12.0,
      },
    ];

    const savedTrips: ChuyenDi[] = [];
    for (const t of tripsData) {
      if (!t.khachHang || !t.xe || !t.bangGia) continue;

      let trip = await chuyenDiRepo.findOne({ where: { ma: t.ma } });
      if (!trip) {
        trip = chuyenDiRepo.create({
          ma: t.ma,
          khachHang: t.khachHang,
          taiXe: t.taiXe,
          xe: t.xe,
          bangGia: t.bangGia,
          diemDon: t.diemDon,
          diemDen: t.diemDen,
          giaUocTinh: t.giaUocTinh,
          giaThucTe: t.giaThucTe,
          trangThai: t.trangThai,
          quangDuongKm: t.quangDuongKm,
          thoiGianDat: new Date('2026-06-01T08:00:00Z'),
          thoiGianBatDau: new Date('2026-06-01T08:10:00Z'),
          thoiGianKetThuc:
            t.trangThai === 'COMPLETED'
              ? new Date('2026-06-01T08:45:00Z')
              : undefined,
        });
        trip = await chuyenDiRepo.save(trip);
        logger.log(`✅ Created trip: ${t.ma} (${t.trangThai})`);
      }
      savedTrips.push(trip);
    }

    // ──────────────────────────────────────────────
    // 7. COMPLAINTS (KhieuNai)
    // ──────────────────────────────────────────────
    const adminUser = await nguoiDungRepo.findOne({
      where: { maNguoiDung: 'ND_ADMIN_001' },
    });

    const complaintsData = [
      {
        maChuyenDi: savedTrips[0]?.maChuyenDi,
        maNguoiGui: savedCustomers[0]?.maNguoiDung,
        noiDungKhieuNai:
          'Tài xế không đi đúng lộ trình đã thỏa thuận, đi vòng vòng làm tăng giá cước lên 10.000đ so với dự kiến.',
        loaiNguoiGui: 'CUSTOMER',
        trangThai: 'PENDING',
      },
      {
        maChuyenDi: savedTrips[1]?.maChuyenDi,
        maNguoiGui: savedCustomers[1]?.maNguoiDung,
        noiDungKhieuNai:
          'Tài xế nói chuyện cộc cằn, không chào hỏi khách và bấm còi gây ồn ào trong suốt chuyến đi.',
        loaiNguoiGui: 'CUSTOMER',
        trangThai: 'PROCESSING',
        maNguoiXuLy: adminUser?.maNguoiDung,
      },
      {
        maChuyenDi: savedTrips[0]?.maChuyenDi,
        maNguoiGui: savedDrivers[0]?.maNguoiDung,
        noiDungKhieuNai:
          'Khách hàng yêu cầu dừng xe giữa đường để mua đồ, làm chậm lộ trình và không chịu thêm phí chờ.',
        loaiNguoiGui: 'DRIVER',
        trangThai: 'RESOLVED',
        maNguoiXuLy: adminUser?.maNguoiDung,
        ketQuaXuLy:
          'Đã xác minh qua lịch sử GPS và nhân viên CSKH. Khách hàng thừa nhận yêu cầu dừng xe. Cả hai bên đã hòa giải, không xử phạt.',
        thoiGianXuLy: new Date('2026-06-03T14:30:00Z'),
      },
      {
        maChuyenDi: savedTrips[2]?.maChuyenDi,
        maNguoiGui: savedCustomers[2]?.maNguoiDung,
        noiDungKhieuNai:
          'Tài xế yêu cầu trả thêm 50.000đ tiền ngoài ứng dụng mới chịu chạy. Hành vi này rất thiếu chuyên nghiệp và vi phạm chính sách.',
        loaiNguoiGui: 'CUSTOMER',
        trangThai: 'RESOLVED',
        maNguoiXuLy: adminUser?.maNguoiDung,
        ketQuaXuLy:
          'Đã liên hệ tài xế, xác minh qua lịch sử chat và GPS. Tài xế thừa nhận vi phạm chính sách. Hoàn tiền 100% cho khách, cảnh cáo tài xế.',
        thoiGianXuLy: new Date('2026-06-04T10:00:00Z'),
      },
      {
        maChuyenDi: savedTrips[1]?.maChuyenDi,
        maNguoiGui: savedDrivers[1]?.maNguoiDung,
        noiDungKhieuNai:
          'Khách hàng hủy chuyến sau khi tài xế đã di chuyển 3km đến điểm đón, gây thiệt hại thời gian và chi phí xăng.',
        loaiNguoiGui: 'DRIVER',
        trangThai: 'REJECTED',
        maNguoiXuLy: adminUser?.maNguoiDung,
        ketQuaXuLy:
          'Theo chính sách hủy chuyến, khách hàng được phép hủy miễn phí trong 5 phút đầu. Thời gian hủy là 3 phút sau khi tài xế nhận chuyến. Không đủ căn cứ xử lý.',
        thoiGianXuLy: new Date('2026-06-02T09:15:00Z'),
      },
    ];

    for (const c of complaintsData) {
      if (!c.maChuyenDi || !c.maNguoiGui) continue;

      const existing = await khieuNaiRepo.findOne({
        where: { noiDungKhieuNai: c.noiDungKhieuNai },
      });
      if (existing) continue;

      const complaint = khieuNaiRepo.create({
        maChuyenDi: c.maChuyenDi,
        maNguoiGui: c.maNguoiGui,
        noiDungKhieuNai: c.noiDungKhieuNai,
        loaiNguoiGui: c.loaiNguoiGui,
        trangThai: c.trangThai,
        maNguoiXuLy: c.maNguoiXuLy,
        ketQuaXuLy: c.ketQuaXuLy,
        thoiGianXuLy: c.thoiGianXuLy,
      });
      await khieuNaiRepo.save(complaint);
      logger.log(
        `✅ Created complaint: [${c.trangThai}] ${c.loaiNguoiGui} - ${c.noiDungKhieuNai.substring(0, 50)}...`,
      );
    }

    // ──────────────────────────────────────────────
    // SUMMARY
    // ──────────────────────────────────────────────
    logger.log('');
    logger.log('═══════════════════════════════════════');
    logger.log('  ✅ TEST DATA CREATED SUCCESSFULLY');
    logger.log('═══════════════════════════════════════');
    logger.log(`   👤 Customers:     ${customersData.length} (Test@123)`);
    logger.log(`   👤 Drivers:       ${driversData.length} (Test@123)`);
    logger.log(`   🚗 Vehicles:      1`);
    logger.log(`   🚕 Trips:         ${tripsData.length}`);
    logger.log(`   📝 Complaints:    ${complaintsData.length}`);
    logger.log('');
    logger.log('   📧 Customer 1: khachhang1@test.com / Test@123');
    logger.log('   📧 Customer 2: khachhang2@test.com / Test@123');
    logger.log('   📧 Customer 3: khachhang3@test.com / Test@123');
    logger.log('   📧 Driver 1:   taixe1@test.com / Test@123');
    logger.log('   📧 Driver 2:   taixe2@test.com / Test@123');
    logger.log('');
    logger.log(
      '   Complaint statuses: PENDING, PROCESSING, RESOLVED x2, REJECTED',
    );
    logger.log('═══════════════════════════════════════');
  } catch (error) {
    logger.error('❌ Error creating test data:', error);
    throw error;
  }
};
