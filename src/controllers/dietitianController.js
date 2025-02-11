const DietitianProfileModel = require("../models/dietitianModel");
const PlanModel = require("../models/planModel");
const UserModel = require("../models/userModel");
const mongoose = require("mongoose");
const getDietitianProfile = async (req, res, next) => {
  try {
    let { id, select } = req.query;
    if (!id) {
      id = req.user._id;
    }
    const selectFields = select ? select.split(" ") : [];

    let query = DietitianProfileModel.findOne({
      $or: [{ userId: id }, { _id: id }],
    }).select(select);

    if (selectFields.includes("plans") || !select) {
      query = query.populate("plans");
    }

    let dietitian = await query;

    if (!dietitian) {
      return res.status(404).json({ message: "Dietitian not found!" });
    }

    res.status(200).json(dietitian);
  } catch (error) {
    next(error);
  }
};

const getDietitianListings = async (req, res, next) => {
  try {
    const query = req.query;

    const sortParams = query.sort;
    const page = query.page || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterParams = query.filter;

    let queryResponsePromise = null;

    // Filtering
    if (filterParams) {
      const filterObj = transformedQueryHelper(filterParams);
      queryResponsePromise = DietitianProfileModel.find(filterObj);
    } else {
      queryResponsePromise = DietitianProfileModel.find();
    }

    // Sorting
    if (sortParams) {
      const [sortParam, order] = sortParams.split(" ");
      queryResponsePromise = queryResponsePromise.sort(
        order === "asc" ? sortParam : `-${sortParam}`
      );
    }

    // Pagination
    queryResponsePromise = queryResponsePromise
      .select(
        "userId name title summary experience rating startingPrice clientsServed"
      )
      .skip(skip)
      .limit(limit);

    const result = await queryResponsePromise;

    const totalCount = await DietitianProfileModel.countDocuments(
      filterParams ? transformedQueryHelper(filterParams) : {}
    );

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      message: "Get dietitian listings successfully",
      data: result,
      pagination: {
        totalItems: totalCount,
        currentPage: parseInt(page),
        pageSize: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Future use
const transfomedQueryHelper = (myQuery) => {
  const parseQuery = JSON.parse(myQuery);
  console.log(parseQuery);

  const queryOperators = {
    gt: "$gt",
    gte: "$gte",
    lt: "$lt",
    lte: "$lte",
  };

  for (let key in parseQuery) {
    // price: {lt: 60}

    let internalObj = parseQuery[key];

    if (typeof internalObj === "object") {
      for (let innerKey in internalObj) {
        // {lt: 60}

        if (queryOperators[innerKey]) {
          internalObj[`$${innerKey}`] = internalObj[innerKey];
          // {$lt:60 }
          delete internalObj[innerKey];
        }
      }
    }
  }

  return parseQuery;
};

const createDietitian = async (req, res, next) => {
  try {
    if (!req.body.userId) {
      next({ statusCode: 400, message: "User Id is required" });
    }

    const user = await UserModel.findById(req.body.userId);

    if (!user) {
      next({
        statusCode: 404,
        message: "User with id:" + req.body.userId + " does not exist.",
      });
    }

    user.role = "dietitian";
    await user.save();

    const dietitian = await DietitianProfileModel.create(req.body);
    res
      .status(201)
      .json({ message: "Dietitian created successfully", dietitian });
  } catch (error) {
    next(error);
  }
};

//Plans controllers
const createPlans = async (req, res, next) => {
  try {
    const dietitianId = req.user._id;
    const plan = req.body;
    const dietitian = await DietitianProfileModel.findOne({
      userId: dietitianId,
    });

    if (!dietitian) {
      next({ statusCode: 404, message: "Dietitian not found" });
    }

    let minPrice = dietitian.startingPrice;

    if (
      (plan.price != 0 && plan.price < minPrice) ||
      dietitian.startingPrice == 0
    ) {
      minPrice = plan.price;
    }

    dietitian.startingPrice = minPrice;

    const createdPlan = await PlanModel.create(plan);
    dietitian.plans = [createdPlan._id, ...dietitian.plans];

    await dietitian.save();
    await dietitian.populate("plans");
    res.status(200).json(dietitian.plans);
  } catch (error) {
    next(error);
  }
};

const updateDietitianProfile = async (req, res, next) => {
  try {
    const dietitianId = req.user._id;
    const updatedFields = req.body;
    const dietitian = await DietitianProfileModel.findOneAndUpdate(
      { userId: dietitianId },
      updatedFields,
      { new: true }
    ).select("title summary description");

    if (!dietitian) {
      return res.status(404).json({ message: "Dietitian not found!" });
    }

    res.status(200).json(dietitian);
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const dietitianId = req.user._id;
    const dietitian = await DietitianProfileModel.findOne({
      userId: dietitianId,
    })
      .select("plans")
      .populate("plans");

    if (!dietitian) {
      return res.status(404).json({ message: "Dietitian not found!" });
    }

    res.status(200).json(dietitian.plans);
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const planId = req.params.id;
    const updatedFields = req.body;
    const plan = await PlanModel.findByIdAndUpdate(
      planId,
      { ...updatedFields },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "plan not found!" });
    }

    res.status(200).json(plan);
  } catch (e) {
    next(e);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const planId = req.params.id;
    const dietitianId = req.user._id;
    const userId = new mongoose.Types.ObjectId(dietitianId);
    const dietitian = await DietitianProfileModel.findOneAndUpdate(
      { userId },
      { $pull: { plans: planId } },
      { new: true }
    ).select("plans");

    if (!dietitian) {
      return res.status(404).json({ message: "Dietitian not found!" });
    }

    const plan = await PlanModel.findByIdAndDelete(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found!" });
    }

    res.status(200).json(plan);
  } catch (e) {
    next(e);
  }
};
module.exports = {
  getDietitianProfile,
  getDietitianListings,
  createDietitian,
  createPlans,
  updateDietitianProfile,
  getPlans,
  updatePlan,
  deletePlan,
};
