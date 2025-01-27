const DietitianProfileModel = require("../models/dietitianModel");
const UserModel = require("../models/userModel");

const getDietitianProfile = async (req, res, next) => {
  try {
    const dietitianId = req.params.id;
    const dietitian = await DietitianProfileModel.findById(dietitianId);
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
      return res.status(400).json({ message: "userId is required!" });
    }

    const user = await UserModel.findById(req.body.userId);

    if (!user) {
      return res.status(404).json({
        message: "User with id: " + req.body.userId + " does not exist.",
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
    const dietitian = await DietitianProfileModel.findOne({
      userId: dietitianId,
    });

    if (!dietitian) {
      return res.status(404).json({ message: "Dietitian not found!" });
    }

    let minPrice = dietitian.startingPrice;

    for (let plan of req.body) {
      if (plan.price != 0 && plan.price < minPrice) {
        minPrice = plan.price;
      }
    }
    dietitian.startingPrice = minPrice;
    if (dietitian.plans !== undefined) {
      dietitian.plans = [...dietitian.plans, ...req.body];
    } else {
      dietitian.plans = [...req.body];
    }

    await dietitian.save();

    res.status(200).json(dietitian);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDietitianProfile,
  getDietitianListings,
  createDietitian,
  createPlans,
};
