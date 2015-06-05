function slide($el, options) {
	var elData = $el.data(),
			elPos = Math.round(options.pos),
			onEndFn = function () {
				elData.sliding = false;
				(options.onEnd || noop)();
			};
	if (typeof options.overPos !== 'undefined' && options.overPos !== options.pos) {
		elPos = options.overPos;
		onEndFn = function () {
			slide($el, $.extend({}, options, {overPos: options.pos, time: Math.max(TRANSITION_DURATION, options.time / 2)}));
		};
	}

	var translate = $.extend(getTranslate(elPos), options.width && {width: options.width});
	elData.sliding = true;
	if (CSS3) {
		$el.css($.extend(getDuration(options.time), translate));
		if (options.time > 10) {
			afterTransition($el, 'transform', onEndFn, options.time);
		} else {
			onEndFn();
		}
	} else {
		$el.stop().animate(translate, options.time, BEZIER, onEndFn);
	}
}

function fade($el1, $el2, $frames, options, fadeStack, chain) {
	$el1 = $el1 || $($el1);
	$el2 = $el2 || $($el2);
	var chainedFLAG = typeof chain !== 'undefined',
			_$el1 = $el1[0],
			_$el2 = $el2[0],
			crossfadeFLAG = options.method === 'crossfade',
			kenburnsFLAG = options.method === 'kenburns',
			onEndFn = function () {
				if (!onEndFn.done) {
					onEndFn.done = true;
					var args = (chainedFLAG || fadeStack.shift()) && fadeStack.shift();
					args && fade.apply(this, args);
					(options.onEnd || noop)(!!args);
				}
			},
			time = options.time / (chain || 1);
	if (!chainedFLAG) {
		fadeStack.push(arguments);
		Array.prototype.push.call(arguments, fadeStack.length);
		if (fadeStack.length > 1) {
			return;
		}
	}

	$frames.removeClass(fadeRearClass + ' ' + fadeFrontClass);
	$el1.stop().addClass(fadeRearClass);
	// randomize the css.class for kenburns-transitions, if the kenbunrs-transition is set
	if (kenburnsFLAG) {
		$el1.addClass(options.kenburnsclasses[Math.floor(Math.random() * options.kenburnsclasses.length)]);
	}

	$el2.stop().addClass(fadeFrontClass);
	crossfadeFLAG && _$el2 && $el1.fadeTo(0, 0);

	if (kenburnsFLAG) {
		$el1.fadeTo(options.kenburnstransitionduration, 1, true && onEndFn);
		$el2.fadeTo(options.kenburnstransitionduration * 0.75, 0, onEndFn);
	} else {
		$el1.fadeTo(crossfadeFLAG ? time : 0, 1, crossfadeFLAG && onEndFn);
		$el2.fadeTo(time, 0, onEndFn);
	}

	(_$el1 && crossfadeFLAG) || _$el2 || onEndFn();
}