-- Create device_token table for FCM push notifications
CREATE TABLE IF NOT EXISTS device_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20),
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  UNIQUE(ma_nguoi_dung, token)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_device_token_user ON device_token(ma_nguoi_dung);
CREATE INDEX IF NOT EXISTS idx_device_token_user_active ON device_token(ma_nguoi_dung, is_active);
CREATE INDEX IF NOT EXISTS idx_device_token_active ON device_token(is_active);
