const User = require("./../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const getUserDetailsFromToken = require('./../helpers/getUserDetailsFromToken')

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, profile_pic } = req.body;
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      return res.status(400).json({
        message: "User already exist",
        error: true,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const payload = {
      name,
      email,
      profile_pic,
      password: hashpassword,
    };

    const user = new User(payload);
    const userSave = await user.save();

    return res.status(201).json({
      message: "User created successfully",
      data: userSave,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};

exports.getUser = async (request, response, next) => {
  try {
    let token = request.cookies.token || ""
    console.log('token-> ',token);
    const user = await getUserDetailsFromToken(token)
    return response.status(200).json({
        message : "user details",
        data : user
    })
} catch (error) {
    return response.status(500).json({
        message : error.message || error,
        error : true
    })
}
};

exports.updateUserDetails = async (request, response) => {
  try {
    const token = request.cookies.token || ""
    const user = await getUserDetailsFromToken(token);
    const { name, profile_pic } = request.body;

    const updateUser = await User.updateOne(
      { _id: user._id },
      {
        name,
        profile_pic,
      },
      {new:true}
    );
    const userInfomation = await User.findById(user._id);

    return response.json({
      message: "user update successfully",
      data: updateUser,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};

exports.searchEmail = async (req, response, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Please check email",
        error: true,
      });
    }

    return response.status(200).json({
      message: "Email verified successfully",
      data:user,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};

exports.login = async (req, response, next) => {
  try {
    const { email,password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Please check email",
        error: true,
      });
    }
    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
      return response.status(400).json({
        message: "Please check password",
        error: true,
      });
    }

    const tokenData = {
      id: user._id,
      email: user.email,
    };
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const cookieOptions = {
      http: true,
      secure: true,
      domain: 'chatter-box-backend-zudn.onrender.com',
    };

    return response.cookie("token", token, cookieOptions).status(200).json({
      message: "Login successfully",
      token: token,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};


exports.searchUser = async (request,response) => {
  try {
      const { search } = request.body

      const query = new RegExp(search,"i","g")
      const user = await User.find({
          "$or" : [
              { name : query },
              { email : query }
          ]
      }).select("-password")
      return response.json({
          message : 'all user',
          data : user,
          success : true
      })
  } catch (error) {
      return response.status(500).json({
          message : error.message || error,
          error : true
      })
  }
}
