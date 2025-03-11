import React, { useState, useEffect } from 'react';
import AdminSidebar from './Sidebar';
import axios from 'axios';
import {
  Content,
  Title,
  AddBookForm,
  FormGroup,
  Label,
  Input,
  Button,
  BookList,
  BookItem,
  BookTitle,
  BookAuthor,
  ActionButton,
} from '../../styles/LibraryStyles';
import styled from "styled-components";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_URL } from '../../constants/url';

export const LibraryContainer = styled.div`
  display: flex;
  padding-left: 240px;
`;

const Library = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
    toast.success('Books fetched successfully');
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/library/getall`);
      setBooks(response.data.books.reverse());
    } catch (error) {
      toast.error('Error fetching books');
    }
  };

  const addBook = async (book) => {
    try {
      const response = await axios.post(`${BACKEND_URL}api/v1/library/books`, {
        bookname: book.title,
        author: book.author,
      });
      fetchBooks();
      setBooks([...books, response.data]);
      toast.success('Book added successfully');
    } catch (error) {
      toast.error('Error adding book');
    }
  };

  const handleBookPick = async (bookId, studentId) => {
    
    console.log(bookId, studentId);
  };

  const handleBookReturn = async (bookId, studentId) => {
    console.log(bookId, studentId);
  };

  return (
    <>
    <LibraryContainer>
      <AdminSidebar />
      <Content>
        <Title>Library Management</Title>
        <AddBookForm
          onSubmit={(e) => {
            e.preventDefault();
            const book = {
              id: Math.random().toString(36).substr(2, 9),
              title: e.target.title.value,
              author: e.target.author.value,
            };
            addBook(book);
            e.target.reset();
          }}
        >
          <h2>Add New Book</h2>
          <FormGroup>
            <Label htmlFor="title">Title:</Label>
            <Input type="text" id="title" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="author">Author:</Label>
            <Input type="text" id="author" required />
          </FormGroup>
          <Button type="submit">Add Book</Button>
        </AddBookForm>

        <h2>Books</h2>
        <BookList>
          {books.map((book) => (
            <BookItem key={book._id}>
              <BookTitle>{book.bookname}</BookTitle>
              <BookAuthor>by {book.author}</BookAuthor>
              {/* <ActionButton onClick={() => handleBookPick(book._id, 'student123')}>Pick</ActionButton> */}
              {/* <ActionButton onClick={() => handleBookReturn(book._id, 'student123')}>Return</ActionButton> */}
            </BookItem>
          ))}
        </BookList>
      </Content>
    </LibraryContainer>
    <ToastContainer />
    </>
  );
};

export default Library;
