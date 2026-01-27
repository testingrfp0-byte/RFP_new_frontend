export const validateChangePasswordFields = ({
    oldPassword,
    newPassword,
    confirmPassword,
}) => {
    const errors = {};

    if (!oldPassword) {
        errors.oldPassword = "Old password is required.";
    }

    if (!newPassword) {
        errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
        errors.newPassword = "New password cannot be same as old password.";
    }

    return errors;
};

export const validateUpdateProfileFields = ({ username, email }) => {
    const errors = {};

    if (!username || !username.trim()) {
        errors.username = "Username is required.";
    }

    if (!email || !email.trim()) {
        errors.email = "Email is required.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
    }

    return errors;
};

export const validateLoginFields = ({ email, password }) => {
    const errors = {};

    if (!email || !email.trim()) {
        errors.email = "Email is required.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    return errors;
};

export const validateRegisterFields = ({ username, email, password }) => {
    const errors = {};

    if (!username || !username.trim()) {
        errors.username = "Username is required.";
    }

    if (!email || !email.trim()) {
        errors.email = "Email is required.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    return errors;
};

export const validateForgotPasswordFields = ({ email }) => {
    const errors = {};

    if (!email || !email.trim()) {
        errors.email = "Email is required.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
    }

    return errors;
};

export const validateResetPasswordFields = ({
    newPassword,
    confirmNewPassword,
}) => {
    const errors = {};

    if (!newPassword) {
        errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmNewPassword) {
        errors.confirmNewPassword = "Confirm password is required.";
    } else if (newPassword !== confirmNewPassword) {
        errors.confirmNewPassword = "Passwords do not match.";
    }

    return errors;
};

export const validateOtpFields = ({ otp }) => {
    const errors = {};

    if (!otp || !otp.trim()) {
        errors.otp = "OTP is required.";
    } else if (!/^\d{4}$/.test(otp)) {
        errors.otp = "OTP must be a 4-digit number.";
    }

    return errors;
};

export const validateRegisterVerifiedFields = ({
    username,
    newPassword,
}) => {
    const errors = {};

    if (!username || !username.trim()) {
        errors.username = "Username is required.";
    }

    if (!newPassword) {
        errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters.";
    }

    return errors;
};

export const validateAdminRegisterFields = ({
    username,
    email,
    password,
}) => {
    const errors = {};

    if (!username || !username.trim()) {
        errors.username = "Username is required.";
    }

    if (!email || !email.trim()) {
        errors.email = "Email is required.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    return errors;
};

export const validateAddQuestionFields = ({ question }) => {
    const errors = {};

    if (!question || !question.trim()) {
        errors.question = "Question is required.";
    } else if (question.trim().length < 5) {
        errors.question = "Question must be at least 5 characters long.";
    }

    return errors;
};

export const validateAddTeamUserFields = ({
    name,
    email,
    password,
}) => {
    const errors = {};

    if (!name || !name.trim()) {
        errors.name = "Full name is required.";
    }

    if (!email || !email.trim()) {
        errors.email = "Email is required.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        }
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    return errors;
};

const validateChatPromptFields = ({ prompt }) => {
    const errors = {};

    if (!prompt || !prompt.trim()) {
        errors.prompt = "Prompt is required.";
    } else if (prompt.trim().length < 5) {
        errors.prompt = "Prompt must be at least 5 characters.";
    }

    return errors;
};
