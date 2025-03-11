export type Todo = {
  id?: number;
  title: string;
  description?: string;
  doneStatus?: boolean;
};

export const TODO: Todo = {
  title: 'Go for a walk',
  doneStatus: true,
  description: '',
};

export const longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

export const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export const extraLongString =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at suscipit odio. Nulla sollicitudin, orci at ornare malesuada, elit diam blandit lorem, vitae aliquet augue sapien mattis ipsum. Cras dui nisi, ultricies vitae turpis id, placerat feugiat nunc. Integer justo erat, pulvinar sit amet tristique et, tincidunt a ante. Maecenas odio libero, congue ut purus vitae, pellentesque sollicitudin turpis. Proin ut eleifend erat, sed volutpat ligula. Proin feugiat dolor diam, sed dictum neque iaculis eget.\n' +
  '\n' +
  'Ut faucibus pretium finibus. In non dignissim leo. Nam at convallis ipsum. Nam velit enim, rhoncus a ipsum vitae, viverra fringilla lectus. Maecenas vitae metus faucibus, gravida magna quis, pellentesque ipsum. Aenean fringilla mollis nulla, eget finibus dolor porttitor a. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.\n' +
  '\n' +
  'Ut et libero ut tortor pretium cursus. Nunc a sollicitudin nunc, ut imperdiet odio. Aliquam malesuada odio sit amet sem ultricies porta. Curabitur vitae nibh vulputate, blandit lorem eget, egestas metus. In pharetra dolor nulla, in posuere sem mattis quis. Praesent tristique ante nibh, at auctor sapien faucibus vitae. Pellentesque in tincidunt leo. Ut ac finibus nulla, in dictum nibh. Fusce et tincidunt purus. Sed accumsan aliquam urna, eu aliquam turpis dictum sit amet. Praesent faucibus, turpis vel elementum dictum, mi ipsum eleifend tellus, sit amet scelerisque diam sem vel velit. Integer malesuada nisl vel urna convallis, vitae volutpat quam luctus.\n' +
  '\n' +
  'Aliquam eget nisi sit amet dui ullamcorper porta nec ac mauris. Donec eu neque quis magna pulvinar vestibulum sed vel eros. Nulla venenatis nec nunc ac euismod. Maecenas posuere iaculis orci, a efficitur nisl convallis ut. Mauris vitae dui est. Praesent auctor, risus eu consectetur dignissim, leo ante finibus massa, ac pharetra nunc tellus vel sapien. Maecenas a nulla at sapien luctus vehicula. Proin et tortor diam. Proin molestie urna et sem molestie, eget iaculis dolor luctus. Pellentesque a risus suscipit, porta magna quis, ornare risus. Donec pellentesque nisi ac convallis faucibus. Nulla vitae vehicula ipsum, at efficitur ante. Praesent euismod hendrerit felis ac blandit. Nulla vitae egestas mi, sit amet tincidunt metus. Vivamus viverra ipsum vel tempor placerat.\n' +
  '\n' +
  'Mauris gravida non lorem ut cursus. Sed eget pellentesque dolor, id posuere sapien. Phasellus sapien massa, euismod vel risus at, commodo bibendum turpis. Phasellus ac arcu quis enim dictum blandit ac at est. Nulla sed convallis purus. Pellentesque neque sapien, volutpat aliquam orci ut, commodo blandit sapien. Nulla vel maximus mauris. Nunc sed mauris neque. Curabitur at scelerisque augue, id ornare quam. Pellentesque maximus euismod urna, in pellentesque odio fermentum a. Sed blandit condimentum lacinia. Suspendisse nec dui bibendum, blandit ante sed, pharetra neque. Vivamus porta sit amet leo non efficitur.\n' +
  '\n' +
  'Phasellus in varius purus. Quisque urna erat, placerat vitae finibus id, vehicula vel velit. Suspendisse aliquet dictum neque a placerat. Proin sit amet viverra odio. Donec eu vehicula lacus. Suspendisse diam ligula, auctor ac mi eu, gravida tempus libero. Vestibulum diam orci, cursus eget dolor vitae, accumsan sagittis elit.\n' +
  '\n' +
  'Mauris dignissim eros eget tristique sodales. Fusce at velit vel quam placerat scelerisque. Quisque hendrerit imperdiet lacus vitae sagittis. Morbi tempus arcu risus, ac pretium est scelerisque fringilla. Donec ultricies faucibus tellus. Donec eros ante, pulvinar quis ultrices in, posuere vitae lorem. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed nec sodales orci, ut tempus massa. Donec ac pharetra nibh, id dapibus ligula.\n' +
  '\n' +
  'Quisque fermentum dui ligula, id efficitur mi egestas id. Etiam pulvinar ac lacus ut malesuada. Nulla orci quam, tristique ac enim gravida, aliquam vulputate neque. Nunc ac ex sodales, hendrerit orci nec, tristique dolor. Nulla sit amet turpis sed sem condimentum accumsan. Proin laoreet faucibus pharetra. Suspendisse at mattis enim. Ut interdum malesuada diam a interdum. Phasellus lobortis dui aliquet rutrum malesuada. Nulla ut tortor commodo, vulputate quam et, interdum mauris. In vel purus et sem scelerisque tristique. Sed fermentum vestibulum libero ac ullamcorper. Nulla aliquet risus mauris, non bibendum diam blandit eget. Cras placerat neque in posuere ornare. Morbi vel condimentum quam.\n' +
  '\n' +
  'Sed vestibulum auctor congue. Quisque eget laoreet quam, ac vestibulum orci. Cras quis finibus diam, vel congue nulla. Cras sed urna suscipit, sodales mauris id, consequat elit. Duis mattis purus vitae orci posuere, et fringilla nisl lacinia. Cras tortor sem, imperdiet id turpis in, bibendum eleifend elit. Proin sed elit nisi. Maecenas enim nunc, cursus ut consequat vitae, sagittis ut odio. Sed ac semper mauris. Maecenas pretium venenatis sem, et pulvinar erat. Ut eget est vitae risus lacinia pellentesque. Pellentesque eu laoreet dui. Proin ornare posuere ornare. In tempor mattis massa nam.';

export const xmlBody = `
  <todo>
    <doneStatus>true</doneStatus>
    <title>file paperwork today</title>
  </todo>
`;
