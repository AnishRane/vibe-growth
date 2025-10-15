import { validate } from 'class-validator';
import { IntentQueryDto } from './intent-query.dto';

describe('IntentQueryDto', () => {
  describe('validation', () => {
    it('should pass validation with valid prompt', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = 'Show me active campaigns';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when prompt is empty', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when prompt is undefined', async () => {
      const dto = new IntentQueryDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
    });

    it('should fail validation when prompt is not a string', async () => {
      const dto = new IntentQueryDto();
      (dto as any).prompt = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when prompt is null', async () => {
      const dto = new IntentQueryDto();
      (dto as any).prompt = null;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
    });

    it('should pass validation with long prompt', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = 'Show me the top 10 active campaigns from last month sorted by highest CTR with conversion rate above 5%';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with special characters in prompt', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = 'Show me campaigns with CTR > 5% and CPC < $0.50';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when prompt is only whitespace (trimming handled by service)', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = '   ';

      const errors = await validate(dto);
      // class-validator's IsNotEmpty doesn't trim whitespace by default
      // The service layer handles trimming and validation
      expect(errors.length).toBe(0);
    });

    it('should pass validation with minimum valid prompt', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = 'a';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with unicode characters', async () => {
      const dto = new IntentQueryDto();
      dto.prompt = 'Show me campaigns 日本語 with émojis 🚀';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when prompt is an object', async () => {
      const dto = new IntentQueryDto();
      (dto as any).prompt = { text: 'campaigns' };

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when prompt is an array', async () => {
      const dto = new IntentQueryDto();
      (dto as any).prompt = ['campaigns'];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when prompt is a boolean', async () => {
      const dto = new IntentQueryDto();
      (dto as any).prompt = true;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prompt');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('DTO structure', () => {
    it('should have prompt property', () => {
      const dto = new IntentQueryDto();
      expect('prompt' in dto).toBe(true);
    });

    it('should allow setting prompt', () => {
      const dto = new IntentQueryDto();
      dto.prompt = 'test prompt';
      expect(dto.prompt).toBe('test prompt');
    });

    it('should be instantiable', () => {
      const dto = new IntentQueryDto();
      expect(dto).toBeInstanceOf(IntentQueryDto);
    });
  });
});

