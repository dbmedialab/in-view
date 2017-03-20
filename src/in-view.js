import Registry from './registry';
import { inViewport } from './viewport';
import throttle from 'lodash/throttle';

/**
* Create and return the inView function.
*/
export default () => {

    /**
    * Fallback if window is undefined.
    */
    if (typeof window === 'undefined') return;

    /**
    * How often and on what events we should check
    * each registry.
    */
    let interval = 100;
    const triggers = ['scroll', 'resize', 'load'];
    let eventOptions = null;

    /**
    * Maintain a hashmap of all registries, a history
    * of selectors to enumerate, and an options object.
    */
    let selectors = { history: [] };
    let options   = { offset: {}, threshold: 0, test: inViewport };


    /**
     * initlize only the throtteling and addEventListener when it is used
     */
    let initialized = false; 
    const init = () => {
        /**
        * Check each registry from selector history,
        * throttled to interval.
        */
        const check = throttle(() => {
            selectors.history.forEach(selector => {
                selectors[selector].check();
            });
        }, interval);

        /**
        * For each trigger event on window, add a listener
        * which checks each registry.
        */
        triggers.forEach(event =>
            addEventListener(event, check, eventOptions));

        /**
        * If supported, use MutationObserver to watch the
        * DOM and run checks on mutation.
        */
        if (window.MutationObserver) {
            addEventListener('DOMContentLoaded', () => {
                new MutationObserver(check)
                    .observe(document.body, { attributes: true, childList: true, subtree: true });
            });
        }
    }
    /**
    * The main interface. Take a selector and retrieve
    * the associated registry or create a new one.
    */
    let control = (selector, selectorOptions = {}) => {

        if(!initialized) {
            init()
            initialized = true
        }

        const actualOptions = {
            "offset": selectorOptions.offset || options.offset,
            "threshold": selectorOptions.threshold || options.threshold,
            "test": selectorOptions.test || options.test
        }

        if (typeof selector !== 'string') return;

        // Get an up-to-date list of elements.
        let elements = [].slice.call(document.querySelectorAll(selector));

        // If the registry exists, update the elements and selectorOptions
        if (selectors.history.indexOf(selector) > -1) {
            selectors[selector].elements = elements;
            selectors[selector].options = actualOptions
        }

        // If it doesn't exist, create a new registry.
        else {
            selectors[selector] = Registry(elements, actualOptions);
            selectors.history.push(selector);
        }

        return selectors[selector];
    };

    /**
     * Check all selectors and emit a exit on the things that are inView
     */
    control.runExitOnElementsCurrentlyInView = () => {
        selectors.history.forEach(selector => {
            selectors[selector].runExitOnElementsCurrentlyInView();
        });
    }

    /**
    * Mutate the offset object with either an object
    * or a number.
    */
    control.offset = o => {
        if (o === undefined) return options.offset;
        const isNum = n => typeof n === 'number';
        ['top', 'right', 'bottom', 'left']
            .forEach(isNum(o) ?
                dim => options.offset[dim] = o :
                dim => isNum(o[dim]) ? options.offset[dim] = o[dim] : null
            );
        return options.offset;
    };

    /**
    * Set the threshold with a number.
    */
    control.threshold = n => {
        return typeof n === 'number' && n >= 0 && n <= 1
            ? options.threshold = n
            : options.threshold;
    };

    /**
    * Use a custom test, overriding inViewport, to
    * determine element visibility.
    */
    control.test = fn => {
        return typeof fn === 'function'
            ? options.test = fn
            : options.test;
    };
 
    /**
    * Add proxy for test function, set defaults,
    * and return the interface.
    */
    control.is = el => options.test(el, options);

    /**
    * Adds the possibility to change the options arg sendt to addEventListener.
    * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener 
    * @return bool false if in-view is already initialized
    */
    control.addEventOptions = newEventOptions => {
        if(initialized) {
         console && console.warn('in-view.js - can not call the function addEventOptions, after in-view is initialized');
         return false;   
        }
        eventOptions = newEventOptions;
    }

    /**
    * Adds the possibility to change the throttled time. 
    * @return bool false if in-view is already initialized
    */
    control.interval = newInterval => {
        if(initialized) {
         console && console.warn('in-view.js - can not call the function interval, after in-view is initialized');
         return false;   
        }
        interval = newInterval;
    }

    control.offset(0);
    return control;

};
