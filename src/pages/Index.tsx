import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/books';

interface Book {
  id?: string;
  title: string;
  author: string;
  date: string;
  status: 'reading' | 'completed' | 'to-read' | '';
}

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState({ author: '', date: '', title: '', status: 'all' });
  const [form, setForm] = useState<Book>({ title: '', author: '', date: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API);
      setBooks(response.data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!form.title || !form.author || !form.date || !form.status) {
      toast({
        title: 'Required fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/author/${form.author}`, form);
      setBooks((prev) => [...prev, response.data]);
      setForm({ title: '', author: '', date: '', status: '' });
      setIsFormOpen(false);
      toast({
        title: 'Success',
        description: 'Book added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async () => {
    if (!editingBook?.id || !form.title || !form.author || !form.date || !form.status) {
      toast({
        title: 'Required fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API}/${editingBook.id}`, form);
      setBooks((prev) => prev.map((book) => (book.id === editingBook.id ? response.data : book)));
      setEditingBook(null);
      setForm({ title: '', author: '', date: '', status: '' });
      setIsFormOpen(false);
      toast({
        title: 'Success',
        description: 'Book updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`);
      setBooks((prev) => prev.filter((book) => book.id !== id));
      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setForm(book);
    setIsFormOpen(true);
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', date: '', status: '' });
    setIsFormOpen(false);
  };

  const filteredBooks = books.filter((book) => {
    return (
      (filter.title === '' || book.title.toLowerCase().includes(filter.title.toLowerCase())) &&
      (filter.author === '' || book.author.toLowerCase().includes(filter.author.toLowerCase())) &&
      (filter.date === '' || book.date.includes(filter.date)) &&
      (filter.status === 'all' || filter.status === '' || book.status === filter.status)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      reading: 'bg-primary text-primary-foreground',
      completed: 'bg-success text-success-foreground',
      'to-read': 'bg-secondary text-secondary-foreground',
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">BookShelf</h1>
                <p className="text-sm text-muted-foreground">Manage your reading collection</p>
              </div>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="gap-2"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filter Books
            </CardTitle>
            <CardDescription>Search and filter your book collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-title">Title</Label>
                <Input
                  id="filter-title"
                  placeholder="Search by title..."
                  value={filter.title}
                  onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-author">Author</Label>
                <Input
                  id="filter-author"
                  placeholder="Search by author..."
                  value={filter.author}
                  onChange={(e) => setFilter({ ...filter, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-date">Date</Label>
                <Input
                  id="filter-date"
                  placeholder="Search by date..."
                  value={filter.date}
                  onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="to-read">To Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <Card className="mb-8 shadow-elevated animate-fade-in border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {editingBook ? 'Update the book details' : 'Fill in the details to add a new book'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Book['status'] })}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="to-read">To Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={editingBook ? handleUpdateBook : handleAddBook}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingBook ? 'Update Book' : 'Add Book'}
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Books Grid */}
        {loading && books.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">
                {books.length === 0 ? 'Start by adding your first book!' : 'Try adjusting your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="font-medium">{book.author}</span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadge(book.status)}>
                      {book.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{book.date}</p>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => startEdit(book)}
                        disabled={loading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => book.id && handleDeleteBook(book.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
