import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import {
  LibraryContainer,
  SidebarContainer,
  Content,
  LibraryHeader,
  BookList,
  BookItem,
  BookTitle,
  BorrowButton,
} from '../../styles/LibraryStyles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_URL } from '../../constants/url';

const LibrarySection = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
    toast.success('Books fetched successfully');
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/library/getall`);
      setBooks(response.data.books);
    } catch (error) {
      toast.error('Error fetching books');
    }
  };

  const handleBorrowBook = (id) => {
    console.log(`Book with ID ${id} has been borrowed.`);
  };

  return (
    <>
    <LibraryContainer>
      <SidebarContainer>
        <Sidebar />
      </SidebarContainer>
      <Content>
        <LibraryHeader>Library</LibraryHeader>
        <BookList>
          {books.map((book) => (
            <BookItem key={book._id}>
              <BookTitle>{book.bookname}</BookTitle>
              <p>Author: {book.author}</p>
              <BorrowButton onClick={() => handleBorrowBook(book._id)}>Borrow</BorrowButton>
            </BookItem>
          ))}
        </BookList>
      </Content>
    </LibraryContainer>
    <ToastContainer />
    </>
  );
};

export default LibrarySection;
