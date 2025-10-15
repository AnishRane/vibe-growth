import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetCampaignsDto, CampaignStatus } from './get-campaigns.dto';

describe('GetCampaignsDto', () => {
  describe('validation', () => {
    it('should pass validation with no parameters', async () => {
      const dto = new GetCampaignsDto();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid status', async () => {
      const dto = new GetCampaignsDto();
      dto.status = CampaignStatus.ACTIVE;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with all valid statuses', async () => {
      const statuses = [
        CampaignStatus.ACTIVE,
        CampaignStatus.PAUSED,
        CampaignStatus.COMPLETED,
      ];

      for (const status of statuses) {
        const dto = new GetCampaignsDto();
        dto.status = status;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should fail validation with invalid status', async () => {
      const dto = new GetCampaignsDto();
      (dto as any).status = 'invalid-status';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should pass validation with valid dateFrom', async () => {
      const dto = new GetCampaignsDto();
      dto.dateFrom = '2025-01-01';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid dateTo', async () => {
      const dto = new GetCampaignsDto();
      dto.dateTo = '2025-12-31';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid dateFrom format', async () => {
      const dto = new GetCampaignsDto();
      dto.dateFrom = 'not-a-date';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dateFrom');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should fail validation with invalid dateTo format', async () => {
      const dto = new GetCampaignsDto();
      dto.dateTo = '01/01/2025';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dateTo');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should pass validation with valid page number', async () => {
      const dto = plainToClass(GetCampaignsDto, { page: '1' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1);
    });

    it('should pass validation with valid limit', async () => {
      const dto = plainToClass(GetCampaignsDto, { limit: '10' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.limit).toBe(10);
    });

    it('should fail validation with page less than 1', async () => {
      const dto = plainToClass(GetCampaignsDto, { page: '0' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation with negative page', async () => {
      const dto = plainToClass(GetCampaignsDto, { page: '-1' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should fail validation with limit less than 1', async () => {
      const dto = plainToClass(GetCampaignsDto, { limit: '0' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation with non-integer page', async () => {
      const dto = plainToClass(GetCampaignsDto, { page: '1.5' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation with non-integer limit', async () => {
      const dto = plainToClass(GetCampaignsDto, { limit: '10.5' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should transform string page to number', async () => {
      const dto = plainToClass(GetCampaignsDto, { page: '5' });
      expect(typeof dto.page).toBe('number');
      expect(dto.page).toBe(5);
    });

    it('should transform string limit to number', async () => {
      const dto = plainToClass(GetCampaignsDto, { limit: '20' });
      expect(typeof dto.limit).toBe('number');
      expect(dto.limit).toBe(20);
    });

    it('should pass validation with all valid parameters', async () => {
      const dto = plainToClass(GetCampaignsDto, {
        status: 'active',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        page: '1',
        limit: '10',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.status).toBe(CampaignStatus.ACTIVE);
      expect(dto.dateFrom).toBe('2025-01-01');
      expect(dto.dateTo).toBe('2025-12-31');
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
    });

    it('should handle optional parameters', async () => {
      const dto = new GetCampaignsDto();
      expect(dto.status).toBeUndefined();
      expect(dto.dateFrom).toBeUndefined();
      expect(dto.dateTo).toBeUndefined();
    });

    it('should use default page value', async () => {
      const dto = new GetCampaignsDto();
      expect(dto.page).toBe(1);
    });

    it('should use default limit value', async () => {
      const dto = new GetCampaignsDto();
      expect(dto.limit).toBe(10);
    });

    it('should fail validation with string page (non-transformable)', async () => {
      const dto = new GetCampaignsDto();
      (dto as any).page = 'not-a-number';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with string limit (non-transformable)', async () => {
      const dto = new GetCampaignsDto();
      (dto as any).limit = 'not-a-number';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with large page number', async () => {
      const dto = plainToClass(GetCampaignsDto, { page: '1000' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(1000);
    });

    it('should pass validation with large limit', async () => {
      const dto = plainToClass(GetCampaignsDto, { limit: '100' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.limit).toBe(100);
    });

    it('should accept ISO 8601 date formats', async () => {
      const dto = new GetCampaignsDto();
      dto.dateFrom = '2025-01-01T00:00:00Z';
      dto.dateTo = '2025-12-31T23:59:59Z';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle date range queries', async () => {
      const dto = new GetCampaignsDto();
      dto.dateFrom = '2025-01-01';
      dto.dateTo = '2025-01-31';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CampaignStatus enum', () => {
    it('should have ACTIVE status', () => {
      expect(CampaignStatus.ACTIVE).toBe('active');
    });

    it('should have PAUSED status', () => {
      expect(CampaignStatus.PAUSED).toBe('paused');
    });

    it('should have COMPLETED status', () => {
      expect(CampaignStatus.COMPLETED).toBe('completed');
    });

    it('should have exactly 3 statuses', () => {
      const statuses = Object.values(CampaignStatus);
      expect(statuses.length).toBe(3);
    });
  });
});

