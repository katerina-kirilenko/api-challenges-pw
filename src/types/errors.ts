export const ErrorMessage = {
  tooLongTitle: 'Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50',
  tooLongDescription: 'Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200',
  extraLong: 'Error: Request body too large, max allowed is 5000 bytes',
  wrongField: (field: string) => `Could not find field: ${field}`,
  wrongTodoId: (id: number) => `No such todo entity instance with id == ${id} found`,
  mandatoryField: 'title : field is mandatory',
  amendId: 'Can not amend id from 1 to 99',
  todoNotFound: (id: number) => `Could not find an instance with todos/${id}`,
  unsupportedContentType: (type: string) => `Unsupported Content Type - ${type}`,
};
