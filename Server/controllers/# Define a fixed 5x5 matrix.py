# Define a fixed 5x5 matrix
matrix = [
    [ 21,  22,  23,  24,  25],
    [ 20,  7,  8,  9, 10],
    [19, 6, 1, 2, 11],
    [18, 5, 4, 3, 12],
    [17, 16, 15, 14, 13]
]

def get_centered_submatrix(matrix, size, center):
    offset = size // 2
    start = center - offset if size % 2 != 0 else center - offset
    end = start + size
    submatrix = [row[start:end] for row in matrix[start:end]]
    return submatrix

def sum_diagonals(submatrix):
    size = len(submatrix)
    primary = sum(submatrix[i][i] for i in range(size))
    secondary = sum(submatrix[i][size - 1 - i] for i in range(size))
    # Avoid double-counting the center element in odd-size matrices
    if size % 2 == 1:
        center = size // 2
        return primary + secondary - submatrix[center][center]
    return primary + secondary

# Example usage
try:
    n = int(input("Enter submatrix size (2 to 5): "))
    if n < 2 or n > 5:
        raise ValueError("❌ Size must be between 2 and 5.")
    
    matrix_size = len(matrix)
    center = matrix_size // 2  # Calculated only once

    sub = get_centered_submatrix(matrix, n, center)
    print("✅ Centered Submatrix:")
    for row in sub:
        print(row)

    diagonal_sum = sum_diagonals(sub)
    print("🔢 Sum of diagonals:", diagonal_sum)

except ValueError as e:
    print(e)
