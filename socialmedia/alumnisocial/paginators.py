from rest_framework.pagination import PageNumberPagination




class CommentPaginator(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
