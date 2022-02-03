import { animate, group, query, state, style, transition, trigger } from '@angular/animations';

export const openClose = trigger('openClose', [
  state(
    'open',
    style({
      overflow: 'hidden',
    })
  ),
  state(
    'closed',
    style({
      height: '0px',
      overflow: 'hidden',
    })
  ),
  transition('open <=> closed', [animate('.3s ease-in')]),
]);

export const flyInOut = trigger('flyInOut', [
  transition(':enter', [style({ transform: 'translateX(100%)' }), animate('.25s')]),
  transition(':leave', [animate('.5s', style({ transform: 'translateX(100%)' }))]),
]);

export const rollInOut = trigger('rollInOut', [
  transition(':enter', [style({ height: '0px' }), animate('.25s')]),
  transition(':leave', [animate('.25s', style({ height: '0px' }))]),
]);

export const fadeIn = trigger('routeAnimations', [
  transition('* => *', [
    style({ position: 'relative' }),
    query(
      ':enter',
      [
        style({
          // position: 'absolute',
          width: '100%',
          opacity: 0,
        }),
      ],
      { optional: true }
    ),

    query(
      ':leave',
      [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 1,
        }),
        animate(
          '0.15s',
          style({
            position: 'absolute',
            width: '100%',
            opacity: 0,
          })
        ),
      ],
      { optional: true }
    ),

    query(
      ':enter',
      [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0,
        }),
        animate(
          '0.15s',
          style({
            position: 'absolute',
            width: '100%',
            opacity: 1,
          })
        ),
      ],
      { optional: true }
    ),
  ]),
]);

export const tagsOpenClose = trigger('tagsOpenClose', [
  state('open', style({})),
  state(
    'closed',
    style({
      width: '0px',
      height: '0px',
    })
  ),
  transition('open <=> closed', [animate('.3s ease-in')]),
]);

export const switchAnimation = trigger('switchAnimations', [
  transition('true => false', [
    query(':enter, :leave', style({})),
    group([
      query(
        ':enter',
        [
          style({ transform: 'translateX(-100%)' }),
          animate('1s ease-in-out', style({ transform: 'translateX(0%)' })),
        ],
        { optional: true }
      ),
      query(
        ':leave',
        [
          style({ transform: 'translateX(0%)', position: 'absolute' }),
          animate('1s ease-in-out', style({ transform: 'translateX(100%)' })),
        ],
        { optional: true }
      ),
    ]),
  ]),
  transition('false => true', [
    query(':enter, :leave', style({})),
    group([
      query(
        ':enter',
        [
          style({ transform: 'translateX(100%)' }),
          animate('1s ease-in-out', style({ transform: 'translateX(0%)' })),
        ],
        { optional: true }
      ),
      query(
        ':leave',
        [
          style({ transform: 'translateX(0%)', position: 'absolute' }),
          animate('1s ease-in-out', style({ transform: 'translateX(-100%)' })),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

export const slideInOutLeft = trigger('slideInOutLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', position: 'relative' }),
    animate('0.5s ease-in', style({ transform: 'translateX(0%)' })),
  ]),
  transition(':leave', [animate('0.5s ease-in', style({ transform: 'translateX(-100%)' }))]),
]);

export const slideInOutRight = trigger('slideInOutRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', position: 'fixed' }),
    animate('0.5s ease-in', style({ transform: 'translateX(0%)' })),
  ]),
  transition(':leave', [
    style({ transform: 'translateX(-100%)', position: 'relative' }),
    animate('0.5s ease-in', style({ transform: 'translateX(100%)' })),
  ]),
]);
