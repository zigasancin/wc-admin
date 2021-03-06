/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { Component } from '@wordpress/element';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import './style.scss';
import { formatCurrency } from 'lib/currency';
import { getColor } from './utils';

function getFormatedTotal( total, valueType ) {
	let rowTotal = total;
	switch ( valueType ) {
		case 'average':
			rowTotal = Math.round( total );
			break;
		case 'currency':
			rowTotal = formatCurrency( total );
			break;
		case 'number':
			break;
	}
	return rowTotal;
}

/**
 * A legend specifically designed for the WooCommerce admin charts.
 */
class Legend extends Component {
	render() {
		const {
			colorScheme,
			data,
			handleLegendHover,
			handleLegendToggle,
			legendDirection,
			valueType,
		} = this.props;
		const colorParams = {
			orderedKeys: data,
			colorScheme,
		};
		const numberOfRowsVisible = data.filter( row => row.visible ).length;

		return (
			<ul
				className={ classNames(
					'woocommerce-legend',
					`woocommerce-legend__direction-${ legendDirection }`,
					this.props.className
				) }
			>
				{ data.map( row => (
					<li
						className={ classNames( 'woocommerce-legend__item', {
							'woocommerce-legend__item-checked': row.visible,
						} ) }
						key={ row.key }
						id={ row.key }
						onMouseEnter={ handleLegendHover }
						onMouseLeave={ handleLegendHover }
						onBlur={ handleLegendHover }
						onFocus={ handleLegendHover }
					>
						<button
							onClick={ handleLegendToggle }
							id={ row.key }
							disabled={ row.visible && numberOfRowsVisible <= 1 }
						>
							<div className="woocommerce-legend__item-container" id={ row.key }>
								<span
									className={ classNames( 'woocommerce-legend__item-checkmark', {
										'woocommerce-legend__item-checkmark-checked': row.visible,
									} ) }
									id={ row.key }
									style={ { color: getColor( row.key, colorParams ) } }
								/>
								<span className="woocommerce-legend__item-title" id={ row.key }>
									{ row.key }
								</span>
								<span className="woocommerce-legend__item-total" id={ row.key }>
									{ getFormatedTotal( row.total, valueType ) }
								</span>
							</div>
						</button>
					</li>
				) ) }
			</ul>
		);
	}
}

Legend.propTypes = {
	/**
	 * Additional CSS classes.
	 */
	className: PropTypes.string,
	/**
	 * A chromatic color function to be passed down to d3.
	 */
	colorScheme: PropTypes.func,
	/**
	 * An array of `orderedKeys`.
	 */
	data: PropTypes.array.isRequired,
	/**
	 * Handles `onClick` event.
	 */
	handleLegendToggle: PropTypes.func,
	/**
	 * Handles `onMouseEnter`/`onMouseLeave` events.
	 */
	handleLegendHover: PropTypes.func,
	/**
	 * Display legend items as a `row` or `column` inside a flex-box.
	 */
	legendDirection: PropTypes.oneOf( [ 'row', 'column' ] ),
	/**
	 * What type of data is to be displayed? Number, Average, String?
	 */
	valueType: PropTypes.string,
};

Legend.defaultProps = {
	legendDirection: 'row',
};

export default Legend;
