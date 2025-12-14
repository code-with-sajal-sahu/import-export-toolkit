import User from "../models/User.js";
import xlsx from "xlsx";
import fs from 'fs'
import Joi from 'joi';
import path from "path";
import moment from "moment";

export const generateErrorExcel = (errors) => {
    const formattedErrors = errors.map(err => ({
        Row: err.row,
        Name: err.data?.Name || err.data?.name || "",
        Email: err.data?.Email || err.data?.email || "",
        Age: err.data?.Age || err.data?.age || "",
        Location: err.data?.Location || err.data?.location || "",
        Reason: err.reason,
    }));

    const worksheet = xlsx.utils.json_to_sheet(formattedErrors);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Errors");

    const dir = "./public/uploads/errors";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const fileName = `import-errors-${Date.now()}.xlsx`;
    const filePath = path.join(dir, fileName);

    xlsx.writeFile(workbook, filePath);

    // Return the relative URL path, e.g., uploads/errors/filename.xlsx
    // Note: The 'dir' variable already contains relative path from root, but looking at 'public/uploads'
    // server.js sets '/uploads' -> 'public/uploads'
    // So 'public/uploads/errors/file.xlsx' should be accessed via '/uploads/errors/file.xlsx'

    return `${fileName}`;
};

const schema = Joi.object({
    Name: Joi.string().required(),
    Email: Joi.string().email().required(),
    Age: Joi.number().required(),
    Location: Joi.string().required(),
});
// @desc    Import users from Excel file
// @route   POST /api/users/import
// @access  Public
export const importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an excel file" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        if (!rows.length) {
            return res.status(400).json({ message: "Excel file is empty" });
        }

        const validUsers = [];
        const errors = [];
        const emails = [];
        // 🔹 Step 1: Validate Excel rows
        rows.forEach((row, index) => {
            const { error, value } = schema.validate(row, { abortEarly: false });

            if (error) {
                errors.push({
                    row: index + 2,
                    reason: error.details.map(d => d.message).join(", "),
                    data: row,
                });
            } else {
                validUsers.push({
                    row: index + 2,
                    ...value
                });
                emails.push(value.Email);
            }
        });

        // 🔹 Step 2: Check duplicates in DB
        const existingUsers = await User.find(
            { email: { $in: emails } },
            { email: 1 }
        );

        const existingEmailSet = new Set(
            existingUsers.map(u => u.email)
        );

        const finalInsert = [];

        validUsers.forEach(user => {
            if (existingEmailSet.has(user.Email)) {
                errors.push({
                    row: user.row,
                    reason: "Email already exists",
                    data: user,
                });
            } else {
                finalInsert.push({
                    name: user.Name,
                    email: user.Email,
                    age: user.Age,
                    location: user.Location,
                });
            }
        });
        console.log(finalInsert);
        // 🔹 Step 3: Insert non-duplicate users
        if (finalInsert.length) {
            await User.insertMany(finalInsert);
        }
        // 🔹 Generate error excel if needed
        let errorFilePath = null;
        if (errors.length) {
            errorFilePath = generateErrorExcel(errors);
        }

        // 🔹 RESPONSE DECISION
        if (finalInsert.length === 0 && errors.length > 0) {
            return res.status(400).json({
                message: "Import failed. No valid records found.",
                insertedCount: 0,
                failedCount: errors.length,
                errors,
                errorFilePath,
            });
        }

        if (finalInsert.length > 0 && errors.length > 0) {
            return res.status(207).json({
                message: "Import completed. Some rows were skipped due to validation errors.",
                insertedCount: finalInsert.length,
                failedCount: errors.length,
                errors,
                errorFilePath,
            });
        }

        // 🔹 Full success
        return res.status(201).json({
            message: "User imported successfully",
            insertedCount: finalInsert.length,
            failedCount: 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};


// @desc    Export users to Excel file (Buffer)
// @route   GET /api/users/export
// @access  Public
export const exportUsers = async (req, res) => {
    try {
        const users = await User.find({}).lean(); // lean() for plain JS objects
        const excelData = users.map(user => ({
            Name: user.name,
            Email: user.email,
            Age: user.age,
            Location: user.location,
            JoinedAt: moment(user.createdAt).format("DD MMM YYYY hh:mm a")
        }));

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(excelData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get sample excel file for import
// @route   GET /api/users/sample
// @access  Public
export const getSampleUsers = async (req, res) => {
    try {
        const sampleData = [
            {
                Name: 'John Doe',
                Email: 'john@example.com',
                Age: 30,
                Location: 'New York'
            },
            {
                Name: 'Jane Smith',
                Email: 'jane@example.com',
                Age: 25,
                Location: 'London'
            }
        ];

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(sampleData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="sample_users.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all users (JSON)
// @route   GET /api/users
// @access  Public
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
