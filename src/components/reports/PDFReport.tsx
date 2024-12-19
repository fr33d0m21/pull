import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { RemovalOrder } from '../../types';
import { format, parseISO } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    fontSize: 10,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    flex: 1,
    fontWeight: 'bold',
  },
  summaryValue: {
    flex: 1,
  },
});

interface PDFReportProps {
  orders: RemovalOrder[];
  storeName: string;
}

const PDFReport = ({ orders, storeName }: PDFReportProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const calculateSummary = () => {
    const totalOrders = orders.length;
    const totalExpected = orders.reduce((sum, order) => sum + order.requestedQuantity, 0);
    const totalReceived = orders.reduce((sum, order) => sum + order.actualReturnQty, 0);
    const totalPending = orders.filter(o => o.orderStatus === 'Pending').length;
    const totalRemovalFees = orders.reduce((sum, order) => sum + (order.removalFee || 0), 0);

    return {
      totalOrders,
      totalExpected,
      totalReceived,
      totalPending,
      totalRemovalFees,
    };
  };

  const summary = calculateSummary();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{storeName} - Pullback Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), 'MMM d, yyyy')}</Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Orders:</Text>
            <Text style={styles.summaryValue}>{summary.totalOrders}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expected Items:</Text>
            <Text style={styles.summaryValue}>{summary.totalExpected}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Received Items:</Text>
            <Text style={styles.summaryValue}>{summary.totalReceived}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pending Orders:</Text>
            <Text style={styles.summaryValue}>{summary.totalPending}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Removal Fees:</Text>
            <Text style={styles.summaryValue}>${summary.totalRemovalFees.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>SKU</Text>
            <Text style={styles.tableCell}>Removal ID</Text>
            <Text style={styles.tableCell}>Expected</Text>
            <Text style={styles.tableCell}>Received</Text>
            <Text style={styles.tableCell}>Status</Text>
          </View>
          {orders.map((order, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{formatDate(order.requestDate)}</Text>
              <Text style={styles.tableCell}>{order.sku}</Text>
              <Text style={styles.tableCell}>{order.removalIdName || order.orderId}</Text>
              <Text style={styles.tableCell}>{order.requestedQuantity}</Text>
              <Text style={styles.tableCell}>{order.actualReturnQty}</Text>
              <Text style={styles.tableCell}>{order.orderStatus}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export function PDFDownloadButton({ orders, storeName }: PDFReportProps) {
  if (!orders.length) return null;

  return (
    <PDFDownloadLink
      document={<PDFReport orders={orders} storeName={storeName} />}
      fileName={`${storeName.toLowerCase().replace(/\s+/g, '-')}-pullback-report.pdf`}
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {({ loading }) => (
        <>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}