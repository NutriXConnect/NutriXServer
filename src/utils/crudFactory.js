const createFactory = (Model) => {
  return async (req, res, next) => {
    try {
      let elementModel = await Model.create(req.body);

      if (!elementModel) {
        const statusCode = 400;
        const message = "Failed to add data";
        console.log("element model not find");
        next({ statusCode: statusCode, message: message });
      }

      res.status(201).json({
        status: "success",
        message: "Data has been registered successfully!",
      });
    } catch (error) {
      next(error);
    }
  };
};

const getFactory = (Model) => {
  return async (req, res, next) => {
    try {
      let elements = await Model.find();
      res.status(200).json(elements);
    } catch (error) {
      next(error);
    }
  };
};

const getByIdFactory = (Model) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      let element = await Model.findById(id);
      res.status(200).json(element);
    } catch (error) {
      next(error);
    }
  };
};

const updateFactory = (Model) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      let element = await Model.findByIdAndUpdate(id, req.body, { new: true });
      if (!element) {
        res.status(404).json({ message: "Data not found!" });
      }
      res.status(200).json(element);
    } catch {
      next(error);
    }
  };
};

const deleteFactory = (Model) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      const element = await Model.findByIdAndDelete(id);
      if (!element) {
        res.status(404).json({ message: "Data not found!" });
      }
      res.status(204);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  createFactory,
  getFactory,
  getByIdFactory,
  updateFactory,
  deleteFactory,
};
