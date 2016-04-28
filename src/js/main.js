require.config({
    baseUrl: '/js/',
    paths: {
        zepto: 'libs/zepto'
    }
});

require(['vendor/a'], function(a){
	'use strict'
    console.log(a.total(5,10));
    // 2x = cc;
})
