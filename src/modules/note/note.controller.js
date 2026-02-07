import { Router } from 'express';
import { authMiddleware } from '../../common/middlewere/auth.middlewere.js';
import { 
  createNote, updateNoteById, replaceNoteById, updateAllNotesTitle,
  deleteNoteById, getPaginatedNotes, getNoteById, getNoteByContent,
  getNotesWithUserInfo, getNotesAggregate, deleteAllNotes 
} from './note.service.js';
import { successResponse } from '../../common/utils/index.js';

const router = Router();

// 1. Create a single note
router.post('/notes', authMiddleware, async (req, res) => {
  const note = await createNote(req.user.userId, req.body);
  return successResponse({ res, statusCode: 201, data: { note } });
});


// 2. Update title of all notes for user
router.patch('/notes/all', authMiddleware, async (req, res) => {
  const { title } = req.body;
  const notes = await updateAllNotesTitle(req.user.userId, title);
  return successResponse({ res, data: { notes } });
});

// 3. Paginated notes
router.get('/notes/paginate-sort', authMiddleware, async (req, res) => {
  const { page, limit } = req.query;
  const notes = await getPaginatedNotes(req.user.userId, page, limit);
  return successResponse({ res, data: { notes } });
});

// 4. Get a note by content
router.get('/notes/note-by-content', authMiddleware, async (req, res) => {
  const { content } = req.query;
  const note = await getNoteByContent(req.user.userId, content);
  return successResponse({ res, data: { note } });
});

// 5. Get all notes with user info
router.get('/notes/note-with-user', authMiddleware, async (req, res) => {
  const notes = await getNotesWithUserInfo(req.user.userId);
  return successResponse({ res, data: { notes } });
});

// 6. Aggregate with search by title
router.get('/notes/aggregate', authMiddleware, async (req, res) => {
  const { title } = req.query;
  const notes = await getNotesAggregate(req.user.userId, title);
  return successResponse({ res, data: { notes } });
});


// 7. Update a single note by ID
router.patch('/notes/:noteId', authMiddleware, async (req, res) => {
  const note = await updateNoteById(req.user.userId, req.params.noteId, req.body);
  return successResponse({ res, data: { note } });
});

// 8. Replace entire note
router.put('/notes/replace/:noteId', authMiddleware, async (req, res) => {
  const note = await replaceNoteById(req.user.userId, req.params.noteId, req.body);
  return successResponse({ res, data: { note } });
});

// 9. Delete a single note
router.delete('/notes/:noteId', authMiddleware, async (req, res) => {
  const note = await deleteNoteById(req.user.userId, req.params.noteId);
  return successResponse({ res, data: { note } });
});

// 10. Get a note by ID
router.get('/notes/:id', authMiddleware, async (req, res) => {
  const note = await getNoteById(req.user.userId, req.params.id);
  return successResponse({ res, data: { note } });
});

// 11. Delete all notes for the logged-in user
router.delete('/notes', authMiddleware, async (req, res) => {
  const result = await deleteAllNotes(req.user.userId);
  return successResponse({ res, data: { result } });
});

export default router;
