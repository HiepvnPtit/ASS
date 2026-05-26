-- Migration: Create tin_nhan (Chat Messages) Table
-- Purpose: Store real-time chat messages between customer and driver during trips
-- Created: 2026-05-25

-- Create tin_nhan table for chat messages
CREATE TABLE IF NOT EXISTS tin_nhan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ma_chuyen_di VARCHAR(50) NOT NULL REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE,
  nguoi_gui_id VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE SET NULL,
  noi_dung TEXT NOT NULL,
  thoi_gian_gui TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  da_doc BOOLEAN NOT NULL DEFAULT FALSE,
  loai_tin_nhan VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (loai_tin_nhan IN ('text', 'image', 'location')),
  media_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tin_nhan_ma_chuyen_di_thoi_gian ON tin_nhan(ma_chuyen_di, thoi_gian_gui);
CREATE INDEX IF NOT EXISTS idx_tin_nhan_ma_chuyen_di_created_at ON tin_nhan(ma_chuyen_di, created_at);
CREATE INDEX IF NOT EXISTS idx_tin_nhan_nguoi_gui_id ON tin_nhan(nguoi_gui_id);

-- Add comments for documentation
COMMENT ON TABLE tin_nhan IS 'Chat messages between customer and driver during a trip';
COMMENT ON COLUMN tin_nhan.id IS 'Primary key - UUID for each message';
COMMENT ON COLUMN tin_nhan.ma_chuyen_di IS 'Reference to the trip (chuyên đi)';
COMMENT ON COLUMN tin_nhan.nguoi_gui_id IS 'Reference to the message sender (người gửi)';
COMMENT ON COLUMN tin_nhan.noi_dung IS 'Message content/body text';
COMMENT ON COLUMN tin_nhan.thoi_gian_gui IS 'Message sent timestamp';
COMMENT ON COLUMN tin_nhan.da_doc IS 'Whether message has been read by recipient';
COMMENT ON COLUMN tin_nhan.loai_tin_nhan IS 'Message type: text, image, or location';
COMMENT ON COLUMN tin_nhan.media_url IS 'URL to attached media if message type is image or location';
COMMENT ON COLUMN tin_nhan.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN tin_nhan.deleted_at IS 'Soft delete timestamp for archival';
