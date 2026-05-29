-- ===========================================================================
-- 1. NHÓM NGƯỜI DÙNG & DANH TÍNH (CORE IDENTITY)
-- ===========================================================================

CREATE TABLE nguoi_dung (
    ma_nguoi_dung VARCHAR(50) PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(50) NOT NULL, -- 'ADMIN', 'CUSTOMER', 'DRIVER'
    trang_thai VARCHAR(50) DEFAULT 'ACTIVE',
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE khach_hang (
    ma_khach_hang VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL UNIQUE,
    dia_chi_mac_dinh TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
);

CREATE TABLE tai_xe (
    ma_tai_xe VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL UNIQUE,
    so_giay_phep_lai_xe VARCHAR(50) UNIQUE NOT NULL,
    can_cuoc_cong_dan VARCHAR(20) UNIQUE NOT NULL,
    diem_danh_gia NUMERIC(3, 2) DEFAULT 5.00,
    trang_thai_hoat_dong VARCHAR(50) DEFAULT 'OFFLINE', -- 'ONLINE', 'OFFLINE', 'BUSY'
    trang_thai_xac_thuc VARCHAR(50) DEFAULT 'PENDING',
    han_giay_phep_lai_xe DATE NOT NULL,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
);

-- ===========================================================================
-- 2. NHÓM PHƯƠNG TIỆN & KỸ NĂNG (VEHICLES & SKILLS)
-- ===========================================================================

CREATE TABLE loai_xe (
    ma_loai_xe VARCHAR(50) PRIMARY KEY,
    so_cho INT NOT NULL,
    hop_so VARCHAR(50) NOT NULL, -- 'MANUAL' (Số sàn), 'AUTOMATIC' (Số tự động)
    phan_khuc VARCHAR(100) NOT NULL -- 'STANDARD', 'LUXURY', v.v.
);

CREATE TABLE xe (
    ma_xe VARCHAR(50) PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL,
    ma_loai_xe VARCHAR(50) NOT NULL,
    bien_so VARCHAR(20) UNIQUE NOT NULL,
    hang_xe VARCHAR(100) NOT NULL,
    dong_xe VARCHAR(100) NOT NULL,
    mau_xe VARCHAR(50),
    cau_truc_sang_so VARCHAR(50),
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang) ON DELETE CASCADE,
    FOREIGN KEY (ma_loai_xe) REFERENCES loai_xe(ma_loai_xe)
);

CREATE TABLE ki_nang_tai_xe (
    ma_ki_nang_tai_xe VARCHAR(50) PRIMARY KEY,
    ma_tai_xe VARCHAR(50) NOT NULL,
    ma_loai_xe VARCHAR(50) NOT NULL,
    so_nam_kinh_nghiem INT DEFAULT 0,
    loai_bang_lai VARCHAR(50),
    ngay_cap DATE,
    ngay_het_han DATE,
    trang_thai VARCHAR(50) DEFAULT 'ACTIVE',
    FOREIGN KEY (ma_tai_xe) REFERENCES tai_xe(ma_tai_xe) ON DELETE CASCADE,
    FOREIGN KEY (ma_loai_xe) REFERENCES loai_xe(ma_loai_xe)
);

-- ===========================================================================
-- 3. NHÓM ĐỊA ĐIỂM & ĐỊNH GIÁ (LOCATIONS & PRICING)
-- ===========================================================================

CREATE TABLE dia_chi_khach_hang (
    ma_dia_chi VARCHAR(50) PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL,
    ten_goi VARCHAR(100), -- 'Nhà riêng', 'Cơ quan'
    dia_chi TEXT NOT NULL,
    vi_do DOUBLE PRECISION NOT NULL,
    kinh_do DOUBLE PRECISION NOT NULL,
    la_dia_chi_mac_dinh BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang) ON DELETE CASCADE
);

CREATE TABLE bang_gia (
    ma_bang_gia VARCHAR(50) PRIMARY KEY,
    ma_loai_xe VARCHAR(50) NOT NULL,
    khu_vuc VARCHAR(255) NOT NULL,
    khung_gio VARCHAR(100) NOT NULL,
    gia_co_ban NUMERIC(12, 2) NOT NULL, -- Tối ưu từ FLOAT sang NUMERIC
    gia_theo_km NUMERIC(12, 2) NOT NULL, -- Tối ưu từ FLOAT sang NUMERIC
    ngay_ap_dung DATE NOT NULL,
    hieu_luc_tu DATE NOT NULL,
    hieu_luc_den DATE,
    FOREIGN KEY (ma_loai_xe) REFERENCES loai_xe(ma_loai_xe)
);

-- ===========================================================================
-- 4. NHÓM NGHIỆP VỤ CHUYẾN ĐI TRUNG TÂM (CORE BUSINESS PROCESS)
-- ===========================================================================

CREATE TABLE chuyen_di (
    ma_chuyen_di VARCHAR(50) PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL,
    ma_tai_xe VARCHAR(50), -- Có thể NULL khi khách vừa đặt, đang chờ tài xế nhận
    ma_xe VARCHAR(50) NOT NULL,
    ma_bang_gia VARCHAR(50) NOT NULL,
    diem_don TEXT NOT NULL,
    diem_den TEXT NOT NULL,
    vi_do_don DOUBLE PRECISION,
    kinh_do_don DOUBLE PRECISION,
    vi_do_den DOUBLE PRECISION,
    kinh_do_den DOUBLE PRECISION,
    thoi_gian_dat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_bat_dau TIMESTAMP WITH TIME ZONE,
    thoi_gian_ket_thuc TIMESTAMP WITH TIME ZONE,
    quang_duong_km REAL,
    gia_uoc_tinh NUMERIC(12, 2) NOT NULL, -- Tối ưu từ FLOAT sang NUMERIC
    gia_thuc_te NUMERIC(12, 2),          -- Tối ưu từ FLOAT sang NUMERIC
    trang_thai VARCHAR(50) NOT NULL, -- 'PENDING', 'ACCEPTED', 'PICKING', 'DRIVING', 'COMPLETED', 'CANCELLED'
    ghi_chu TEXT,
    FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_tai_xe) REFERENCES tai_xe(ma_tai_xe),
    FOREIGN KEY (ma_xe) REFERENCES xe(ma_xe),
    FOREIGN KEY (ma_bang_gia) REFERENCES bang_gia(ma_bang_gia)
);

CREATE TABLE lich_su_trang_thai (
    ma_lich_su VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL,
    trang_thai_cu VARCHAR(50),
    trang_thai_moi VARCHAR(50) NOT NULL,
    thoi_gian_cap_nhat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nguoi_cap_nhat VARCHAR(50) NOT NULL,
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE
);

-- ===========================================================================
-- 5. NHÓM MINH BẠCH & PHÁP LÝ (SAFETY, TRANSFERS & PROOFS)
-- ===========================================================================

CREATE TABLE bien_ban_ban_giao_xe (
    ma_bien_ban VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL UNIQUE,
    tinh_trang_truoc_khi_ban_giao TEXT,
    tinh_trang_sau_khi_ban_giao TEXT,
    muc_nhien_lieu_truoc REAL,
    muc_nhien_lieu_sau REAL,
    so_km_truoc REAL,
    so_km_sau REAL,
    thoi_gian_tao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ghi_chu TEXT,
    ma_khach_hang_xac_nhan VARCHAR(50) NOT NULL,
    ma_tai_xe_xac_nhan VARCHAR(50) NOT NULL,
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE,
    FOREIGN KEY (ma_khach_hang_xac_nhan) REFERENCES khach_hang(ma_khach_hang),
    FOREIGN KEY (ma_tai_xe_xac_nhan) REFERENCES tai_xe(ma_tai_xe)
);

CREATE TABLE anh_chung_thuc (
    ma_anh VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL,
    ma_bien_ban VARCHAR(50) NOT NULL,
    duong_dan TEXT NOT NULL,
    mo_ta TEXT,
    loai_anh VARCHAR(50) NOT NULL, -- 'BEFORE_TRIP', 'AFTER_TRIP'
    thoi_gian_tao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE,
    FOREIGN KEY (ma_bien_ban) REFERENCES bien_ban_ban_giao_xe(ma_bien_ban) ON DELETE CASCADE
);

-- ===========================================================================
-- 6. NHÓM GIAO DỊCH, PHẢN HỒI & LOG VỊ TRÍ (FINANCE, FEEDBACK & TELEMETRY)
-- ===========================================================================

CREATE TABLE thanh_toan (
    ma_thanh_toan VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL UNIQUE,
    so_tien NUMERIC(12, 2) NOT NULL, -- Tối ưu từ FLOAT sang NUMERIC
    phuong_thuc_thanh_toan VARCHAR(50) NOT NULL, -- 'CASH', 'E-WALLET', 'CREDIT'
    trang_thai_thanh_toan VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESSFUL', 'FAILED'
    thoi_gian_thanh_toan TIMESTAMP WITH TIME ZONE,
    ma_giao_dich_ngoai VARCHAR(100), -- ID kết nối với cổng Stripe/Momo/VNPAY
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE
);

CREATE TABLE danh_gia (
    ma_danh_gia VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL UNIQUE, -- Tối ưu hóa chuẩn 3NF: Loại bỏ ma_khach_hang, ma_tai_xe dư thừa
    so_sao INT NOT NULL CHECK (so_sao BETWEEN 1 AND 5),
    noi_dung TEXT,
    thoi_gian_danh_gia TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE
);

CREATE TABLE khieu_nai (
    ma_khieu_nai VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL, -- Tối ưu hóa chuẩn 3NF: Loại bỏ ma_khach_hang dư thừa
    ma_nguoi_xu_ly VARCHAR(50), -- FK liên kết đến bảng nguoi_dung (vai trò ADMIN)
    trang_thai VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'
    noi_dung_khieu_nai TEXT NOT NULL,
    loai_nguoi_gui VARCHAR(50) NOT NULL, -- 'CUSTOMER', 'DRIVER'
    ket_qua_xu_ly TEXT,
    thoi_gian_tao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_lu_choi TIMESTAMP WITH TIME ZONE, -- Giữ nguyên gốc thời gian chờ từ ERD của bạn
    thoi_gian_xu_ly TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE,
    FOREIGN KEY (ma_nguoi_xu_ly) REFERENCES nguoi_dung(ma_nguoi_dung)
);

CREATE TABLE vi_tri (
    ma_vi_tri VARCHAR(50) PRIMARY KEY,
    ma_chuyen_di VARCHAR(50) NOT NULL, -- Tối ưu hóa: Thiết lập kết nối trực tiếp với Chuyến đi
    ma_tai_xe VARCHAR(50), -- Direct reference to driver (nullable for customer locations)
    loai_doi_tuong VARCHAR(50) NOT NULL, -- 'CUSTOMER', 'DRIVER'
    loai_su_kien VARCHAR(50) NOT NULL, -- 'REALTIME_SHARE', 'PICKUP_UPDATE', 'ARRIVED', 'WAYPOINT'
    vi_do DOUBLE PRECISION NOT NULL,     -- Sử dụng DOUBLE PRECISION thay vì String để tính toán tọa độ địa lý hình học
    kinh_do DOUBLE PRECISION NOT NULL,    -- Sử dụng DOUBLE PRECISION thay vì String
    thoi_gian_cap_nhat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE,
    FOREIGN KEY (ma_tai_xe) REFERENCES tai_xe(ma_tai_xe) ON DELETE SET NULL
);