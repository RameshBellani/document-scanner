let express = require('express');
let cors = require('cors');
let unggah = require('express-fileupload');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const path = require('path');

var app = express();
app.use(cors());
app.use(unggah());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/img', express.static('storage'));

// Ensure the storage directory exists
const storagePath = path.join(__dirname, 'storage');
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

app.get('/', (req, res) => {
    res.send('<h1>Node.js OCR</h1>');
});

const capturedImage = async (req, res, next) => {
    try {
        const imagePath = path.join(storagePath, 'ocr_image.jpeg'); // Use path.join for cross-platform compatibility
        let imgdata = req.body.img; // Get img as base64
        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, ''); // Convert base64
        fs.writeFileSync(imagePath, base64Data, { encoding: 'base64' }); // Write img file

        Tesseract.recognize(
            imagePath, // Update to use the local path
            'eng',
            { logger: m => console.log(m) }
        )
        .then(({ data: { text } }) => {
            console.log(text);
            return res.send({
                image: imgdata,
                path: imagePath,
                text: text
            });
        });

    } catch (e) {
        next(e);
    }
};

app.post('/capture', capturedImage);

app.post('/upload', (req, res) => {
    if (req.files) {
        console.log(req.files);
        var unggahFile = req.files.file;
        var namaFile = unggahFile.name;
        unggahFile.mv(path.join(storagePath, namaFile), (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            // Perform OCR on the uploaded file
            Tesseract.recognize(
                path.join(storagePath, namaFile),
                'eng',
                { logger: m => console.log(m) }
            )
            .then(({ data: { text } }) => {
                console.log(text);
                return res.send({
                    image: `http://localhost:5000/img/${namaFile}`,
                    path: `http://localhost:5000/img/${namaFile}`,
                    text: text
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).send(err);
            });
        });
    } else {
        res.status(400).send('No files were uploaded.');
    }
});

app.listen(5000, () => {
    console.log('Server running at port 5000!');
});
