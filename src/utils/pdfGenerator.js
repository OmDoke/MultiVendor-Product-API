const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateProductPdf = (product, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF to the response
    doc.pipe(res);

    // Header
    doc.fontSize(25).text('Product Detail Report', { align: 'center' });
    doc.moveDown();

    // Product Info
    doc.fontSize(18).text(`Product Name: ${product.productName}`);
    doc.fontSize(12).text(`Description: ${product.productDescription}`);
    doc.moveDown();

    doc.fontSize(16).text('Brand Details:', { underline: true });
    doc.moveDown(0.5);

    let totalPrice = 0;

    product.brands.forEach((brand, index) => {
        doc.fontSize(14).text(`Brand ${index + 1}: ${brand.brandName}`);
        doc.fontSize(12).text(`Detail: ${brand.detail}`);
        doc.fontSize(12).text(`Price: $${brand.price}`);
        
        const imagePath = path.join(__dirname, '../uploads', brand.image);
        if (fs.existsSync(imagePath)) {
            try {
                doc.image(imagePath, {
                    fit: [100, 100],
                    align: 'center'
                });
                doc.moveDown(7); // Space for image
            } catch (err) {
                doc.text('(Image not loadable)', { color: 'red' });
                doc.moveDown();
            }
        } else {
            doc.text('(Image missing on disk)', { color: 'red' });
            doc.moveDown();
        }
        
        totalPrice += brand.price;
        doc.moveDown();
    });

    // Total Price
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(16).text(`Total Price: $${totalPrice}`, { align: 'right' });

    doc.end();
};

module.exports = { generateProductPdf };
