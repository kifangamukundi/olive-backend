const Guest = require("../models/Guest");

// Get all guests
exports.getAllGuests = async (req, res, next) => {
    try {
      const guests = await Guest.find();
      res.status(200).json({ success: true, data: { guests } });
    } catch (err) {
      next(err);
    }
  };
  
  // Get a specific guest
  exports.getGuestById = async (req, res, next) => {
    const { guestId } = req.params;
    try {
      const guest = await Guest.findById(guestId);
      if (!guest) {
        return res.status(404).json({ success: false, message: "Guest not found" });
      }
      res.status(200).json({ success: true, data: { guest } });
    } catch (err) {
      next(err);
    }
  };
  
  // Create a new guest
  exports.createGuest = async (req, res, next) => {
    const { name, email, phone, address } = req.body;
    try {
      const guest = await Guest.create({ name, email, phone, address });
      res.status(201).json({ success: true, message: "Guest created successfully", data: { guest } });
    } catch (err) {
      next(err);
    }
  };
  
  // Update or delete a specific guest
  exports.updateOrDeleteGuest = async (req, res, next) => {
    const { guestId } = req.params;
    try {
      const guest = await Guest.findById(guestId);
      if (!guest) {
        return res.status(404).json({ success: false, message: "Guest not found" });
      }
      if (req.method === "DELETE") {
        await guest.remove();
        return res.status(200).json({ success: true, message: "Guest deleted successfully" });
      } else {
        const { name, email, phone, address } = req.body;
        guest.name = name;
        guest.email = email;
        guest.phone = phone;
        guest.address = address;
        await guest.save();
        return res.status(200).json({ success: true, message: "Guest updated successfully", data: { guest } });
      }
    } catch (err) {
      next(err);
    }
  };
  