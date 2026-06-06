/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { KhieuNaiService } from './khieu-nai.service';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { CreateKhieuNaiDto } from './dto/create-khieu-nai.dto';
import { UpdateKhieuNaiStatusDto } from './dto/update-khieu-nai-status.dto';

describe('KhieuNaiService', () => {
  let service: KhieuNaiService;
  let repo: any;

  // Mock data helpers
  const mockComplaint = (overrides: Partial<KhieuNai> = {}): KhieuNai => ({
    maKhieuNai: 'mock-uuid-123',
    maChuyenDi: 'trip-uuid-456',
    maNguoiGui: 'user-uuid-001',
    maNguoiXuLy: undefined,
    chuyenDi: { maChuyenDi: 'trip-uuid-456' } as any,
    nguoiGui: { maNguoiDung: 'user-uuid-001' } as any,
    nguoiXuLy: undefined,
    trangThai: 'PENDING',
    noiDungKhieuNai: '',
    loaiNguoiGui: 'CUSTOMER',
    thoiGianTao: new Date('2026-06-01T10:00:00Z'),
    thoiGianXuLy: undefined,
    thoiGianLuChoi: undefined,
    ketQuaXuLy: undefined,
    ...overrides,
  });

  const mockComplaintEntity = (dto: Partial<KhieuNai> = {}): KhieuNai => ({
    maKhieuNai: dto.maKhieuNai ?? 'new-uuid-abc',
    maChuyenDi: dto.maChuyenDi ?? 'trip-uuid-456',
    maNguoiGui: dto.maNguoiGui ?? 'user-uuid-001',
    maNguoiXuLy: dto.maNguoiXuLy,
    chuyenDi: dto.chuyenDi ?? ({ maChuyenDi: 'trip-uuid-456' } as any),
    nguoiGui: dto.nguoiGui ?? ({ maNguoiDung: 'user-uuid-001' } as any),
    nguoiXuLy: dto.nguoiXuLy,
    trangThai: dto.trangThai ?? 'PENDING',
    noiDungKhieuNai: dto.noiDungKhieuNai ?? '',
    loaiNguoiGui: dto.loaiNguoiGui ?? 'CUSTOMER',
    thoiGianTao: dto.thoiGianTao ?? new Date('2026-06-01T10:00:00Z'),
    thoiGianXuLy: dto.thoiGianXuLy,
    thoiGianLuChoi: dto.thoiGianLuChoi,
    ketQuaXuLy: dto.ketQuaXuLy,
  });

  beforeEach(async () => {
    repo = {
      metadata: { tableName: 'khieu_nai' } as any,
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      update: jest.fn().mockResolvedValue({ affected: 0 }),
      count: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KhieuNaiService,
        {
          provide: getRepositoryToken(KhieuNai),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<KhieuNaiService>(KhieuNaiService);
  });

  describe('create - Tạo khiếu nại mới', () => {
    it('should CUSTOMER: tạo khiếu nại về tài xế đi sai lộ trình', async () => {
      const dto: CreateKhieuNaiDto = {
        maChuyenDi: 'trip-uuid-456',
        noiDungKhieuNai:
          'Tài xế không đi đúng lộ trình đã thỏa thuận, đi vòng vòng làm tăng giá cước.',
        loaiNguoiGui: 'CUSTOMER',
      };

      const saved = mockComplaintEntity({
        maKhieuNai: 'complaint-uuid-1',
        chuyenDi: { maChuyenDi: dto.maChuyenDi } as any,
        noiDungKhieuNai: dto.noiDungKhieuNai,
        loaiNguoiGui: dto.loaiNguoiGui,
        trangThai: 'PENDING',
      });

      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await service.createComplaint('user-uuid-001', dto);

      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        maNguoiGui: 'user-uuid-001',
        trangThai: 'PENDING',
      });
      expect(repo.save).toHaveBeenCalledWith(saved);
      expect(result.trangThai).toBe('PENDING');
      expect(result.loaiNguoiGui).toBe('CUSTOMER');
      expect(result.maKhieuNai).toBe('complaint-uuid-1');
    });

    it('should CUSTOMER: tạo khiếu nại về thái độ tài xế', async () => {
      const dto: CreateKhieuNaiDto = {
        maChuyenDi: 'trip-uuid-789',
        noiDungKhieuNai:
          'Tài xế nói chuyện cộc cằn, không giúp khách xách hành lý và bấm còi gây ồn.',
        loaiNguoiGui: 'CUSTOMER',
      };

      const saved = mockComplaintEntity({
        maKhieuNai: 'complaint-uuid-2',
        noiDungKhieuNai: dto.noiDungKhieuNai,
        loaiNguoiGui: dto.loaiNguoiGui,
      });

      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await service.createComplaint('user-uuid-002', dto);

      expect(result.loaiNguoiGui).toBe('CUSTOMER');
      expect(result.trangThai).toBe('PENDING');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should DRIVER: tạo khiếu nại về khách hàng hủy chuyến muộn', async () => {
      const dto: CreateKhieuNaiDto = {
        maChuyenDi: 'trip-uuid-101',
        noiDungKhieuNai:
          'Khách hàng đặt xe rồi hủy sau 15 phút khi tài xế đã đến điểm đón, gây thiệt hại thời gian và công sức.',
        loaiNguoiGui: 'DRIVER',
      };

      const saved = mockComplaintEntity({
        maKhieuNai: 'complaint-uuid-3',
        noiDungKhieuNai: dto.noiDungKhieuNai,
        loaiNguoiGui: dto.loaiNguoiGui,
      });

      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await service.createComplaint('driver-uuid-001', dto);

      expect(result.loaiNguoiGui).toBe('DRIVER');
      expect(result.trangThai).toBe('PENDING');
    });

    it('should DRIVER: tạo khiếu nại về khách hàng làm bẩn xe', async () => {
      const dto: CreateKhieuNaiDto = {
        maChuyenDi: 'trip-uuid-202',
        noiDungKhieuNai:
          'Khách hàng mang đồ ăn lên xe làm đổ nước sốt ra ghế và không chịu bồi thường.',
        loaiNguoiGui: 'DRIVER',
      };

      const saved = mockComplaintEntity({
        maKhieuNai: 'complaint-uuid-4',
        noiDungKhieuNai: dto.noiDungKhieuNai,
        loaiNguoiGui: dto.loaiNguoiGui,
      });

      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await service.createComplaint('driver-uuid-002', dto);

      expect(result.loaiNguoiGui).toBe('DRIVER');
      expect(result.trangThai).toBe('PENDING');
    });

    it('should ném BadRequestException khi không có maChuyenDi (thiếu thông tin bắt buộc)', async () => {
      const dto: CreateKhieuNaiDto = {
        maChuyenDi: '',
        noiDungKhieuNai: 'Nội dung khiếu nại hợp lệ...',
        loaiNguoiGui: 'CUSTOMER',
      };

      await expect(
        service.createComplaint('user-uuid-001', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMyComplaints - Người dùng xem khiếu nại của mình', () => {
    it('should người dùng thấy danh sách khiếu nại của mình', async () => {
      const complaints = [
        mockComplaint({
          maKhieuNai: 'c-1',
          noiDungKhieuNai: 'Khiếu nại về tài xế',
          thoiGianTao: new Date('2026-06-02T10:00:00Z'),
        }),
        mockComplaint({
          maKhieuNai: 'c-2',
          noiDungKhieuNai: 'Khiếu nại về giá cước',
          thoiGianTao: new Date('2026-06-01T10:00:00Z'),
        }),
      ];

      repo.find!.mockResolvedValue(complaints);

      const result = await service.findMyComplaints('user-uuid-001', {
        skip: 0,
        take: 20,
      });

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          order: { thoiGianTao: 'DESC' },
          relations: ['chuyenDi', 'nguoiGui', 'nguoiXuLy'],
          where: { maNguoiGui: 'user-uuid-001' },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0].maKhieuNai).toBe('c-1');
    });

    it('should trả về mảng rỗng nếu chưa có khiếu nại nào', async () => {
      repo.find!.mockResolvedValue([]);

      const result = await service.findMyComplaints('user-uuid-999', {
        skip: 0,
        take: 20,
      });

      expect(result).toEqual([]);
    });
  });

  describe('findAllForAdmin - Admin quản lý khiếu nại', () => {
    it('should admin xem danh sách khiếu nại không lọc', async () => {
      const data = [
        mockComplaint({ maKhieuNai: 'c-1', trangThai: 'PENDING' }),
        mockComplaint({ maKhieuNai: 'c-2', trangThai: 'PROCESSING' }),
        mockComplaint({ maKhieuNai: 'c-3', trangThai: 'RESOLVED' }),
      ];

      repo.findAndCount!.mockResolvedValue([data, 3]);

      const result = await service.findAllForAdmin({ skip: 0, take: 20 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 20,
        }),
      );
      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(3);
    });

    it('should admin lọc khiếu nại theo trạng thái PENDING (chờ xử lý)', async () => {
      const pendingComplaints = [
        mockComplaint({ maKhieuNai: 'c-pending-1', trangThai: 'PENDING' }),
      ];

      repo.findAndCount!.mockResolvedValue([pendingComplaints, 1]);

      const result = await service.findAllForAdmin({
        trangThai: 'PENDING',
        skip: 0,
        take: 20,
      });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trangThai: 'PENDING' },
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].trangThai).toBe('PENDING');
    });

    it('should admin lọc khiếu nại theo loại người gửi DRIVER', async () => {
      const driverComplaints = [
        mockComplaint({ maKhieuNai: 'c-driver-1', loaiNguoiGui: 'DRIVER' }),
      ];

      repo.findAndCount!.mockResolvedValue([driverComplaints, 1]);

      const result = await service.findAllForAdmin({
        loaiNguoiGui: 'DRIVER',
        skip: 0,
        take: 20,
      });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { loaiNguoiGui: 'DRIVER' },
        }),
      );
      expect(result.data[0].loaiNguoiGui).toBe('DRIVER');
    });

    it('should admin phân trang khi xem danh sách', async () => {
      const data = [mockComplaint({ maKhieuNai: 'c-page-1' })];
      repo.findAndCount!.mockResolvedValue([data, 10]);

      const result = await service.findAllForAdmin({ skip: 5, take: 5 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
      expect(result.total).toBe(10);
    });
  });

  describe('resolve - Admin xử lý / giải quyết khiếu nại', () => {
    it('should admin giải quyết khiếu nại với kết luận RESOLVED', async () => {
      const existing = mockComplaint({
        maKhieuNai: 'complaint-resolve-1',
        noiDungKhieuNai: 'Tài xế đi sai lộ trình',
        trangThai: 'PENDING',
      });

      const resolvedComplaint = mockComplaintEntity({
        ...existing,
        trangThai: 'RESOLVED',
        ketQuaXuLy:
          'Đã xác minh qua camera. Tài xế đi đúng lộ trình thỏa thuận. Giải thích và làm rõ với khách hàng.',
        thoiGianXuLy: new Date('2026-06-03T14:00:00Z'),
      });

      repo.findOne!.mockResolvedValueOnce(existing);
      repo.update!.mockResolvedValue({ affected: 1 } as any);
      repo.findOne!.mockResolvedValueOnce(resolvedComplaint);

      const dto: UpdateKhieuNaiStatusDto = {
        trangThai: 'RESOLVED',
        ketQuaXuLy:
          'Đã xác minh qua camera. Tài xế đi đúng lộ trình thỏa thuận. Giải thích và làm rõ với khách hàng.',
      };

      const result = await service.resolve(
        'complaint-resolve-1',
        dto,
        'admin-uuid-001',
      );

      expect(repo.update).toHaveBeenCalledWith(
        { maKhieuNai: 'complaint-resolve-1' },
        expect.objectContaining({
          trangThai: 'RESOLVED',
          ketQuaXuLy: dto.ketQuaXuLy,
          thoiGianXuLy: expect.any(Date),
        }),
      );
      expect(result.trangThai).toBe('RESOLVED');
      expect(result.ketQuaXuLy).toBe(dto.ketQuaXuLy);
    });

    it('should admin từ chối khiếu nại với trạng thái REJECTED (không đủ cơ sở)', async () => {
      const existing = mockComplaint({
        maKhieuNai: 'complaint-reject-1',
        noiDungKhieuNai: 'Tài xế không bật điều hòa',
        trangThai: 'PROCESSING',
      });

      const rejectedComplaint = mockComplaintEntity({
        ...existing,
        trangThai: 'REJECTED',
        ketQuaXuLy:
          'Theo dữ liệu cảm biến xe, điều hòa hoạt động bình thường suốt chuyến. Không đủ cơ sở xử lý.',
        thoiGianXuLy: new Date('2026-06-03T15:00:00Z'),
      });

      repo.findOne!.mockResolvedValueOnce(existing);
      repo.update!.mockResolvedValue({ affected: 1 } as any);
      repo.findOne!.mockResolvedValueOnce(rejectedComplaint);

      const dto: UpdateKhieuNaiStatusDto = {
        trangThai: 'REJECTED',
        ketQuaXuLy:
          'Theo dữ liệu cảm biến xe, điều hòa hoạt động bình thường suốt chuyến. Không đủ cơ sở xử lý.',
      };

      const result = await service.resolve(
        'complaint-reject-1',
        dto,
        'admin-uuid-001',
      );

      expect(result.trangThai).toBe('REJECTED');
      expect(result.thoiGianXuLy).toBeDefined();
    });

    it('should admin chuyển trạng thái PROCESSING để bắt đầu xử lý', async () => {
      const existing = mockComplaint({
        maKhieuNai: 'complaint-proc-1',
        noiDungKhieuNai: 'Khiếu nại cần xem xét thêm',
        trangThai: 'PENDING',
      });

      const processing = mockComplaintEntity({
        ...existing,
        trangThai: 'PROCESSING',
      });

      repo.findOne!.mockResolvedValueOnce(existing);
      repo.update!.mockResolvedValue({ affected: 1 } as any);
      repo.findOne!.mockResolvedValueOnce(processing);

      const dto: UpdateKhieuNaiStatusDto = { trangThai: 'PROCESSING' };

      const result = await service.resolve(
        'complaint-proc-1',
        dto,
        'admin-uuid-001',
      );

      expect(result.trangThai).toBe('PROCESSING');
      // PROCESSING không phải trạng thái cuối => không ghi thoiGianXuLy
      // Nhưng vẫn ghi maNguoiXuLy và không ghi thoiGianXuLy
      expect(repo.update).toHaveBeenCalledWith(
        { maKhieuNai: 'complaint-proc-1' },
        expect.objectContaining({
          trangThai: 'PROCESSING',
          maNguoiXuLy: 'admin-uuid-001',
        }),
      );
    });

    it('should ném NotFoundException khi khiếu nại không tồn tại', async () => {
      repo.findOne!.mockResolvedValue(null);

      const dto: UpdateKhieuNaiStatusDto = {
        trangThai: 'RESOLVED',
        ketQuaXuLy: 'Đã xử lý xong.',
      };

      await expect(
        service.resolve('nonexistent-id', dto, 'admin-uuid-001'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics - Thống kê khiếu nại', () => {
    it('should trả về thống kê chính xác với các trạng thái', async () => {
      repo
        .count!.mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(20) // pending
        .mockResolvedValueOnce(10) // processing
        .mockResolvedValueOnce(15) // resolved
        .mockResolvedValueOnce(5); // rejected

      const stats = await service.getStatistics();

      expect(stats).toEqual({
        total: 50,
        pending: 20,
        processing: 10,
        resolved: 15,
        rejected: 5,
      });

      expect(repo.count).toHaveBeenNthCalledWith(1); // total
      expect(repo.count).toHaveBeenNthCalledWith(2, {
        where: { trangThai: 'PENDING' },
      });
      expect(repo.count).toHaveBeenNthCalledWith(5, {
        where: { trangThai: 'REJECTED' },
      });
    });

    it('should trả về 0 cho tất cả khi chưa có khiếu nại nào', async () => {
      repo
        .count!.mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const stats = await service.getStatistics();

      expect(stats).toEqual({
        total: 0,
        pending: 0,
        processing: 0,
        resolved: 0,
        rejected: 0,
      });
    });
  });

  describe('Luồng thực tế kết hợp - End-to-end scenario', () => {
    it('should mô phỏng: KH tạo khiếu nại → Admin xử lý → Hoàn tất', async () => {
      // Bước 1: Khách hàng tạo khiếu nại về tài xế đòi tiền ngoài app
      const createDto: CreateKhieuNaiDto = {
        maChuyenDi: 'real-trip-uuid',
        noiDungKhieuNai:
          'Tài xế yêu cầu trả thêm tiền ngoài ứng dụng mới chịu chạy. Hành vi này rất thiếu chuyên nghiệp.',
        loaiNguoiGui: 'CUSTOMER',
      };

      const createdComplaint = mockComplaintEntity({
        maKhieuNai: 'real-complaint-1',
        noiDungKhieuNai: createDto.noiDungKhieuNai,
        loaiNguoiGui: createDto.loaiNguoiGui,
        trangThai: 'PENDING',
      });

      repo.create!.mockReturnValueOnce(createdComplaint);
      repo.save!.mockResolvedValueOnce(createdComplaint);

      const createResult = await service.createComplaint(
        'customer-uuid',
        createDto,
      );
      expect(createResult.trangThai).toBe('PENDING');
      expect(createResult.loaiNguoiGui).toBe('CUSTOMER');

      // Bước 2: Admin xem danh sách khiếu nại đang chờ
      repo.findAndCount!.mockResolvedValueOnce([[createdComplaint], 1]);

      const pendingList = await service.findAllForAdmin({
        trangThai: 'PENDING',
        skip: 0,
        take: 20,
      });
      expect(pendingList.total).toBe(1);

      // Bước 3: Admin đánh dấu đang xử lý
      repo.findOne!.mockResolvedValueOnce(createdComplaint);
      repo.update!.mockResolvedValue({ affected: 1 } as any);

      const processingEntity = mockComplaintEntity({
        ...createdComplaint,
        trangThai: 'PROCESSING',
      });
      repo.findOne!.mockResolvedValueOnce(processingEntity);

      await service.resolve(
        'real-complaint-1',
        { trangThai: 'PROCESSING' },
        'admin-uuid',
      );

      // Bước 4: Admin giải quyết - chấp nhận khiếu nại
      repo.findOne!.mockResolvedValueOnce(processingEntity);
      repo.update!.mockResolvedValue({ affected: 1 } as any);

      const resolvedEntity = mockComplaintEntity({
        ...createdComplaint,
        trangThai: 'RESOLVED',
        ketQuaXuLy:
          'Đã liên hệ tài xế, xác minh qua lịch sử chat và GPS. Tài xế thừa nhận vi phạm chính sách. Hoàn tiền 50% cho khách, cảnh cáo tài xế.',
        thoiGianXuLy: new Date(),
      });
      repo.findOne!.mockResolvedValueOnce(resolvedEntity);

      const resolveDto: UpdateKhieuNaiStatusDto = {
        trangThai: 'RESOLVED',
        ketQuaXuLy:
          'Đã liên hệ tài xế, xác minh qua lịch sử chat và GPS. Tài xế thừa nhận vi phạm chính sách. Hoàn tiền 50% cho khách, cảnh cáo tài xế.',
      };

      const finalResult = await service.resolve(
        'real-complaint-1',
        resolveDto,
        'admin-uuid',
      );
      expect(finalResult.trangThai).toBe('RESOLVED');
      expect(finalResult.ketQuaXuLy).toContain('Hoàn tiền');
      expect(finalResult.thoiGianXuLy).toBeDefined();

      // Bước 5: Xem thống kê
      repo
        .count!.mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(0) // pending
        .mockResolvedValueOnce(0) // processing
        .mockResolvedValueOnce(1) // resolved
        .mockResolvedValueOnce(0); // rejected

      const stats = await service.getStatistics();
      expect(stats.total).toBe(1);
      expect(stats.resolved).toBe(1);
    });
  });
});
