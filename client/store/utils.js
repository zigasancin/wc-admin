/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';
/**
 * Internal dependencies
 */
import { getActiveFiltersFromQuery, getUrlKey } from 'components/filters/advanced/utils';

/**
 * Returns a string representation of a sorted query object.
 *
 * @param {Object} query Current state
 * @return {String}       Query Key
 */
export function getJsonString( query = {} ) {
	return JSON.stringify( query, Object.keys( query ).sort() );
}

export function getFiltersQuery( query, filters, advancedFilters ) {
	const { filter } = query;

	if ( ! filter ) {
		return {};
	}

	if ( 'advanced' === filter ) {
		const activeFilters = getActiveFiltersFromQuery( query, advancedFilters );
		return activeFilters.reduce(
			( result, activeFilter ) => {
				const { key, rule, value } = activeFilter;
				result[ getUrlKey( key, rule ) ] = value;
				return result;
			},
			{ match: query.match || 'all' }
		);
	}

	const filterConfig = find( filters, { value: filter } );

	if ( 0 === query.filter.indexOf( 'compare' ) ) {
		const { param } = filterConfig.settings;

		if ( query[ param ] ) {
			return {
				[ param ]: query[ param ],
			};
		}

		return {};
	}

	if ( filterConfig.query ) {
		return filter.query;
	}

	if ( filterConfig.subFilters ) {
		const subFilterConfig = find( filterConfig.subFilters, subFilter => {
			return query[ subFilter.value ];
		} );

		if ( subFilterConfig ) {
			return {
				[ subFilterConfig.value ]: query[ subFilterConfig.value ],
			};
		}

		return {};
	}

	return {};
}
