/** @format */
/**
 * External dependencies
 */
import { Component, createElement } from '@wordpress/element';
import { parse } from 'qs';
import { find, omitBy, isUndefined, last } from 'lodash';

/**
 * Internal dependencies
 */
import Analytics from 'analytics';
import AnalyticsReport from 'analytics/report';
import Dashboard from 'dashboard';
import DevDocs from 'devdocs';
import { stringifyQuery } from 'lib/nav-utils';

const getPages = () => {
	const pages = [
		{
			container: Dashboard,
			path: '/',
			wpMenu: 'toplevel_page_woocommerce',
		},
		{
			container: Analytics,
			path: '/analytics',
			wpMenu: 'toplevel_page_wc-admin--analytics',
		},
		{
			container: AnalyticsReport,
			path: '/analytics/:report',
			wpMenu: 'toplevel_page_wc-admin--analytics',
		},
		{
			container: DevDocs,
			path: '/devdocs',
			wpMenu: 'toplevel_page_woocommerce',
		},
		{
			container: DevDocs,
			path: '/devdocs/:component',
			wpMenu: 'toplevel_page_woocommerce',
		},
	];

	return pages;
};

class Controller extends Component {
	render() {
		// Pass URL parameters (example :report -> params.report) and query string parameters
		const { path, url, params } = this.props.match;
		const search = this.props.location.search.substring( 1 );
		const query = parse( search );
		const page = find( getPages(), { path } );
		window.wpNavMenuUrlUpdate( query );
		window.wpNavMenuClassChange( page.wpMenu, this.props.location.pathname );
		return createElement( page.container, { params, path: url, pathMatch: path, query } );
	}
}

window.wpNavMenuUrlUpdate = function( { period, compare, after, before } ) {
	const timeRelatedQuery = omitBy( { period, compare, after, before }, isUndefined );
	const search = stringifyQuery( timeRelatedQuery );

	Array.from( document.querySelectorAll( '#toplevel_page_wc-admin--analytics a' ) ).forEach(
		function( item ) {
			const hashUrl = last( item.href.split( 'wc-admin#' ) );
			const base = hashUrl.split( '?' )[ 0 ];
			const href = '/wp-admin/admin.php?page=wc-admin#' + base + search;
			item.href = href;
		}
	);
};

// When the route changes, we need to update wp-admin's menu with the correct section & current link
window.wpNavMenuClassChange = function( menuClass, pathname ) {
	const path = '/' === pathname ? '' : '#' + pathname;
	Array.from( document.getElementsByClassName( 'current' ) ).forEach( function( item ) {
		item.classList.remove( 'current' );
	} );

	const submenu = document.querySelector( '.wp-has-current-submenu' );
	submenu.classList.remove( 'wp-has-current-submenu' );
	submenu.classList.remove( 'wp-menu-open' );
	submenu.classList.remove( 'selected' );
	submenu.classList.add( 'wp-not-current-submenu' );
	submenu.classList.add( 'menu-top' );

	Array.from(
		document.querySelectorAll( `li > a[href$="admin.php?page=wc-admin${ path }"]` )
	).forEach( function( item ) {
		item.parentElement.classList.add( 'current' );
	} );

	const currentMenu = document.querySelector( '#' + menuClass );
	currentMenu.classList.remove( 'wp-not-current-submenu' );
	currentMenu.classList.add( 'wp-has-current-submenu' );
	currentMenu.classList.add( 'wp-menu-open' );
	currentMenu.classList.add( 'current' );
};

export { Controller, getPages };
