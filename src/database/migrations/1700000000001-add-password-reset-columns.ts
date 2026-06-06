import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordResetColumns1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'nguoi_dung',
      new TableColumn({
        name: 'mat_khau_reset_token',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'nguoi_dung',
      new TableColumn({
        name: 'mat_khau_reset_token_expires',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    console.log('✅ Added password reset columns to nguoi_dung table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('nguoi_dung', 'mat_khau_reset_token_expires');
    await queryRunner.dropColumn('nguoi_dung', 'mat_khau_reset_token');

    console.log('✅ Dropped password reset columns from nguoi_dung table');
  }
}
