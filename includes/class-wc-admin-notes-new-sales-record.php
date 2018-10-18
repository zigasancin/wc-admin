<?php
/**
 * WooCommerce Admin (Dashboard) New Sales Record Note Provider.
 *
 * Adds a note to the merchant's inbox when the previous day's sales are a new record.
 *
 * @package WooCommerce Admin
 */

defined( 'ABSPATH' ) || exit;

/**
 * WC_Admin_Notes_New_Sales_Record
 */
class WC_Admin_Notes_New_Sales_Record {
	const RECORD_DATE_OPTION_KEY   = 'woocommerce_sales_record_date'; // ISO 8601 (YYYY-MM-DD) date.
	const RECORD_AMOUNT_OPTION_KEY = 'woocommerce_sales_record_amount';

	/**
	 * Sales Record constructor.
	 */
	public function __construct() {
		add_action( 'admin_footer', array( $this, 'possibly_add_sales_record_note' ) );
	}

	/**
	 * Returns the total of yesterday's sales.
	 *
	 * @param string $date Date for sales to sum (i.e. YYYY-MM-DD).
	 * @return floatval
	 */
	public function sum_sales_for_date( $date ) {
		$order_query = new WC_Order_Query( array( 'date_created' => $date ) );
		$orders      = $order_query->get_orders();
		$total       = 0;

		foreach ( (array) $orders as $order ) {
			$total += $order->get_total();
		}

		return $total;
	}

	/**
	 * Possibly add a sales record note.
	 */
	public function possibly_add_sales_record_note() {
		$yesterday = date( 'Y-m-d', current_time( 'timestamp', 0 ) - DAY_IN_SECONDS );
		$total     = $this->sum_sales_for_date( $yesterday );

		// No sales yesterday? Bail.
		if ( 0 >= $total ) {
			return;
		}

		$record_date = get_option( self::RECORD_DATE_OPTION_KEY, '' );
		$record_amt  = floatval( get_option( self::RECORD_AMOUNT_OPTION_KEY, 0 ) );

		// No previous entry? Just enter what we have and return without generating a note.
		if ( empty( $record_date ) ) {
			update_option( self::RECORD_DATE_OPTION_KEY, $yesterday );
			update_option( self::RECORD_AMOUNT_OPTION_KEY, $total );
				return;
		}

		// Otherwise, if yesterdays total bested the record, update AND generate a note.
		if ( $total > $record_amt ) {
			update_option( self::RECORD_DATE_OPTION_KEY, $yesterday );
			update_option( self::RECORD_AMOUNT_OPTION_KEY, $total );

			$formatted_yesterday   = date( 'F jS', strtotime( $yesterday ) );
			$formatted_total       = html_entity_decode( strip_tags( wc_price( $total ) ) );
			$formatted_record_date = date( 'F jS', strtotime( $record_date ) );
			$formatted_record_amt  = html_entity_decode( strip_tags( wc_price( $record_amt ) ) );

			$content = sprintf(
				/* translators: 1 and 4: Date (e.g. October 16th), 2 and 3: Amount (e.g. $160.00) */
				__( 'Woohoo, %1$s was your record day for sales! Net revenue was %2$s beating the previous record of %3$s set on %4$s.', 'wc-admin' ),
				$formatted_yesterday,
				$formatted_total,
				$formatted_record_amt,
				$formatted_record_date
			);

			$content_data = (object) array(
				'old_record_date' => $record_date,
				'old_record_amt'  => $record_amt,
				'new_record_date' => $yesterday,
				'new_record_amt'  => $total,
			);

			$name = 'wc-admin-new-sales-record';
			// We only want one sales record note at any time in the inbox, so we delete any other first.
			WC_Admin_Notes::delete_notes_with_name( $name );

			// And now, create our new note.
			$note = new WC_Admin_Note();
			$note->set_title( __( 'New sales record!', 'wc-admin' ) );
			$note->set_content( $content );
			$note->set_content_data( $content_data );
			$note->set_type( WC_Admin_Note::E_WC_ADMIN_NOTE_INFORMATIONAL );
			$note->set_icon( 'trophy' );
			$note->set_name( $name );
			$note->set_source( 'wc-admin' );
			$note->add_action( 'view-report', __( 'View report', 'wc-admin' ), '?page=wc-admin#/analytics' );
			$note->save();
		}
	}
}

// TODO Call schedule_recurring for once each day at 1 am or something.
new WC_Admin_Notes_New_Sales_Record();
