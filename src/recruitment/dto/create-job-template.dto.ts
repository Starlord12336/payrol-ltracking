export class CreateJobTemplateDto {
  title?: string;
  department?: string;
  qualifications?: string[];
  skills?: string[];
  description?: string;
  // Optional organization position code to import from OS
  positionCode?: string;
}
