import createSlicer from './createSlicer.js'
import mergeState from './util/mergeState.js'
import Cookies from 'universal-cookie';

/**
 * @description
 * persistState is a Store Enhancer that syncs (a subset of) store state to cookie.
 *
 * @param {String|String[]} [paths] Specify keys to sync with cookie, if left undefined the whole store is persisted
 * @param {Object} [config] Optional config object
 * @param {String} [config.key="redux"] String used as cookie key
 * @param {Function} [config.slicer] (paths) => (state) => subset. A function that returns a subset
 * of store state that should be persisted to cookie
 *
 * @return {Function} An enhanced store
 */
export default function persistState(paths, config) {
    const cookies = new Cookies();

    const cfg = {
        key: 'redux',
        merge: mergeState,
        slicer: createSlicer,
        cookieOptions: {
            path: '/'
        },
        ...config
    }

    const {key, merge, slicer, cookieOptions} = cfg

    return next => (reducer, initialState, enhancer) => {
        if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
            enhancer = initialState
            initialState = undefined
        }

        let persistedState
        let finalInitialState

        try {
            persistedState = cookies.get(key)
            finalInitialState = merge(initialState, persistedState)
        } catch ( e ) {
            console.warn('Failed to retrieve initialize state from cookie:', e)
        }

        const store = next(reducer, finalInitialState, enhancer)
        const slicerFn = slicer(paths)

        store.subscribe(function() {
            const state = store.getState()
            const subset = slicerFn(state)

            try {
                cookies.set(key, subset, cookieOptions);
            } catch ( e ) {
                console.warn('Unable to persist state to cookie:', e)
            }
        })

        return store
    }
}
