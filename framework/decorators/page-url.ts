'use strict';

import 'reflect-metadata';

export function PageUrl(url: string) {
    return function(constructor) {
        constructor.pageUrl = url;
    };
}
