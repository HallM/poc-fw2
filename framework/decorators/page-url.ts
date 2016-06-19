'use strict';

import 'reflect-metadata';

export const PageUrlMetaKey = Symbol("RoutingPageUrl");

export function PageUrl(url: string) {
    return function(constructor) {
        constructor.pageUrl = url;
    };
}
