import { NoteModel } from "../../DB/index.js";
import { NotFound, conflictException } from "../../common/utils/index.js";

// 1. Create a single note
export const createNote = async (userId, inputs) => {
  const note = await NoteModel.create({
    ...inputs,
    userId
  });
  return note;
};

// 2. Update a single note by ID
export const updateNoteById = async (userId, noteId, inputs) => {
  const note = await NoteModel.findOneAndUpdate(
    { _id: noteId, userId },
    inputs,
    { new: true }
  );
  if (!note) throw NotFound({ message: "Note not found or not yours" });
  return note;
};

// 3. Replace entire note
export const replaceNoteById = async (userId, noteId, inputs) => {
  const note = await NoteModel.findOneAndReplace(
    { _id: noteId, userId },
    inputs,
    { new: true }
  );
  if (!note) throw NotFound({ message: "Note not found or not yours" });
  return note;
};

// 4. Update title of all notes for user
export const updateAllNotesTitle = async (userId, title) => {
  const result = await NoteModel.updateMany(
    { userId },
    { $set: { title } },
    { new: true }
  );
  return result;
};

// 5. Delete a single note
export const deleteNoteById = async (userId, noteId) => {
  const note = await NoteModel.findOneAndDelete({ _id: noteId, userId });
  if (!note) throw NotFound({ message: "Note not found or not yours" });
  return note;
};

// 6. Paginated notes
export const getPaginatedNotes = async (userId, page = 1, limit = 5) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const notes = await NoteModel.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return notes;
};

// 7. Get a note by ID
export const getNoteById = async (userId, noteId) => {
  const note = await NoteModel.findOne({ _id: noteId, userId });
  if (!note) throw NotFound({ message: "Note not found or not yours" });
  return note;
};

// 8. Get a note by content
export const getNoteByContent = async (userId, content) => {
  const note = await NoteModel.findOne({ userId, content });
  if (!note) throw NotFound({ message: "Note not found or not yours" });
  return note;
};

// 9. Get all notes with user info (title, userId, createdAt + user email)
export const getNotesWithUserInfo = async (userId) => {
  const notes = await NoteModel.aggregate([
    { $match: { userId: userId } },
    { 
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    { $project: { title: 1, userId: 1, createdAt: 1, "user.email": 1 } }
  ]);
  return notes;
};

// 10. Aggregate with search by title
export const getNotesAggregate = async (userId, title) => {
  const matchStage = { userId };
  if (title) matchStage.title = { $regex: title, $options: "i" };

  const notes = await NoteModel.aggregate([
    { $match: matchStage },
    { 
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    { $project: { title: 1, content: 1, createdAt: 1, "user.name": 1, "user.email": 1 } }
  ]);
  return notes;
};

// 11. Delete all notes for the logged-in user
export const deleteAllNotes = async (userId) => {
  const result = await NoteModel.deleteMany({ userId });
  return { deletedCount: result.deletedCount };
};
