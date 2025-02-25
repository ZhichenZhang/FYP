import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end === totalPages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
        aria-label="Previous page"
      >
        ←
      </button>

      {getPageNumbers().map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;